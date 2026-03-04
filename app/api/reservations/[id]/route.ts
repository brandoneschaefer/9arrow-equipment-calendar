import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { syncDealToHubSpot } from '@/lib/hubspot';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const reservation = await prisma.reservation.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        equipment: true,
      },
    });

    if (!reservation) {
      return NextResponse.json(
        { error: 'Reservation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(reservation);
  } catch (error) {
    console.error('Error fetching reservation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const reservation = await prisma.reservation.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!reservation) {
      return NextResponse.json(
        { error: 'Reservation not found' },
        { status: 404 }
      );
    }

    const {
      companyName,
      contactName,
      contactEmail,
      contactPhone,
      checkInTime,
      checkOutTime,
      notes,
    } = await request.json();

    // Use existing values if not provided
    const newCheckIn = checkInTime ? new Date(checkInTime) : reservation.checkInTime;
    const newCheckOut = checkOutTime ? new Date(checkOutTime) : reservation.checkOutTime;

    if (newCheckOut <= newCheckIn) {
      return NextResponse.json(
        { error: 'Check-out time must be after check-in time' },
        { status: 400 }
      );
    }

    // Check for overlapping reservations (excluding current reservation)
    const overlapping = await prisma.reservation.findFirst({
      where: {
        equipmentId: reservation.equipmentId,
        id: { not: params.id },
        AND: [
          { checkInTime: { lt: newCheckOut } },
          { checkOutTime: { gt: newCheckIn } },
        ],
      },
    });

    if (overlapping) {
      return NextResponse.json(
        { error: `This equipment is already reserved from ${overlapping.checkInTime.toISOString().split('T')[0]} to ${overlapping.checkOutTime.toISOString().split('T')[0]}. Please choose different dates.` },
        { status: 409 }
      );
    }

    const updatedReservation = await prisma.reservation.update({
      where: { id: params.id },
      data: {
        ...(companyName && { companyName }),
        ...(contactName && { contactName }),
        ...(contactEmail && { contactEmail }),
        ...(contactPhone && { contactPhone }),
        ...(checkInTime && { checkInTime: newCheckIn }),
        ...(checkOutTime && { checkOutTime: newCheckOut }),
        ...(notes !== undefined && { notes }),
      },
      include: {
        equipment: true,
      },
    });

    // Sync update to HubSpot if deal exists
    if (updatedReservation.hubspotDealId) {
      try {
        const checkInDate = checkInTime
          ? newCheckIn.toISOString().split('T')[0]
          : undefined;
        const checkOutDate = checkOutTime
          ? newCheckOut.toISOString().split('T')[0]
          : undefined;

        await syncDealToHubSpot(
          {
            dealname: `${updatedReservation.companyName} - ${updatedReservation.equipment.name} Rental`,
            dealstage: 'negotiation',
            ...(checkOutDate && { closedate: checkOutDate }),
            ...(checkInDate && { customfield_checkin_date: checkInDate }),
          },
          updatedReservation.hubspotDealId
        );
      } catch (hubspotError) {
        console.error('HubSpot sync error (non-blocking):', hubspotError);
      }
    }

    return NextResponse.json(updatedReservation);
  } catch (error) {
    console.error('Error updating reservation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const reservation = await prisma.reservation.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!reservation) {
      return NextResponse.json(
        { error: 'Reservation not found' },
        { status: 404 }
      );
    }

    await prisma.reservation.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting reservation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
