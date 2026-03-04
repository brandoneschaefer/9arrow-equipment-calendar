import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { syncDealToHubSpot, associateDealWithContactAndCompany } from '@/lib/hubspot';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const reservations = await prisma.reservation.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        equipment: true,
      },
      orderBy: {
        checkInTime: 'asc',
      },
    });

    return NextResponse.json(reservations);
  } catch (error) {
    console.error('Error fetching reservations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const {
      equipmentId,
      companyName,
      contactName,
      contactEmail,
      contactPhone,
      checkInTime,
      checkOutTime,
      notes,
    } = await request.json();

    if (!equipmentId || !companyName || !contactName || !checkInTime || !checkOutTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create reservation
    const reservation = await prisma.reservation.create({
      data: {
        equipmentId,
        userId: session.user.id,
        companyName,
        contactName,
        contactEmail: contactEmail || null,
        contactPhone: contactPhone || null,
        checkInTime: new Date(checkInTime),
        checkOutTime: new Date(checkOutTime),
        notes: notes || null,
      },
      include: {
        equipment: true,
      },
    });

    // Sync to HubSpot
    try {
      const dealName = `${companyName} - ${reservation.equipment.name} Rental`;
      const checkInDate = new Date(checkInTime).toISOString().split('T')[0];
      const checkOutDate = new Date(checkOutTime).toISOString().split('T')[0];

      const hubspotDeal = await syncDealToHubSpot({
        dealname: dealName,
        dealstage: 'negotiation',
        closedate: checkOutDate,
        customfield_checkin_date: checkInDate,
        customfield_company_name: companyName,
        customfield_contact_name: contactName,
      });

      if (hubspotDeal) {
        // Update reservation with HubSpot deal ID
        await prisma.reservation.update({
          where: { id: reservation.id },
          data: { hubspotDealId: hubspotDeal.id },
        });
      }
    } catch (hubspotError) {
      console.error('HubSpot sync error (non-blocking):', hubspotError);
      // Continue even if HubSpot sync fails
    }

    return NextResponse.json(reservation, { status: 201 });
  } catch (error) {
    console.error('Error creating reservation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
