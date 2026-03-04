import axios from 'axios';

const HUBSPOT_API_BASE_URL = process.env.HUBSPOT_API_BASE_URL || 'https://api.hubapi.com';
const HUBSPOT_TOKEN = process.env.HUBSPOT_PRIVATE_APP_TOKEN;

const hubspotClient = axios.create({
  baseURL: HUBSPOT_API_BASE_URL,
  headers: {
    Authorization: `Bearer ${HUBSPOT_TOKEN}`,
    'Content-Type': 'application/json',
  },
});

export interface HubSpotContact {
  id: string;
  properties: {
    firstname?: string;
    lastname?: string;
    email?: string;
    phone?: string;
  };
}

export interface HubSpotCompany {
  id: string;
  properties: {
    name?: string;
    hs_lead_status?: string;
  };
}

export interface HubSpotDeal {
  id: string;
  properties: {
    dealname?: string;
    dealstage?: string;
    [key: string]: any;
  };
}

// Fetch contact from HubSpot
export async function getHubSpotContact(contactId: string): Promise<HubSpotContact | null> {
  try {
    const response = await hubspotClient.get(`/crm/v3/objects/contacts/${contactId}`, {
      params: {
        properties: ['firstname', 'lastname', 'email', 'phone'],
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching HubSpot contact:', error);
    return null;
  }
}

// Search for contact by email
export async function searchHubSpotContactByEmail(email: string): Promise<HubSpotContact | null> {
  try {
    const response = await hubspotClient.post('/crm/v3/objects/contacts/search', {
      filterGroups: [
        {
          filters: [
            {
              propertyName: 'email',
              operator: 'EQ',
              value: email,
            },
          ],
        },
      ],
      sorts: [{ propertyName: 'hs_object_id', direction: 'DESCENDING' }],
      limit: 1,
      after: 0,
    });

    if (response.data.results && response.data.results.length > 0) {
      return response.data.results[0];
    }
    return null;
  } catch (error) {
    console.error('Error searching HubSpot contact:', error);
    return null;
  }
}

// Fetch company from HubSpot
export async function getHubSpotCompany(companyId: string): Promise<HubSpotCompany | null> {
  try {
    const response = await hubspotClient.get(`/crm/v3/objects/companies/${companyId}`, {
      params: {
        properties: ['name', 'hs_lead_status'],
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching HubSpot company:', error);
    return null;
  }
}

// Create or update deal in HubSpot
export async function syncDealToHubSpot(
  dealData: {
    dealname: string;
    dealstage?: string;
    amount?: number;
    closedate?: string;
    hubspot_owner_id?: string;
    [key: string]: any;
  },
  dealId?: string
): Promise<HubSpotDeal | null> {
  try {
    const properties = Object.entries(dealData).map(([key, value]) => ({
      name: key,
      value: String(value),
    }));

    if (dealId) {
      // Update existing deal
      const response = await hubspotClient.patch(
        `/crm/v3/objects/deals/${dealId}`,
        { properties }
      );
      return response.data;
    } else {
      // Create new deal
      const response = await hubspotClient.post('/crm/v3/objects/deals', {
        properties,
      });
      return response.data;
    }
  } catch (error) {
    console.error('Error syncing deal to HubSpot:', error);
    return null;
  }
}

// Associate deal with contact and company
export async function associateDealWithContactAndCompany(
  dealId: string,
  contactId: string,
  companyId: string
): Promise<boolean> {
  try {
    // Associate deal with contact
    await hubspotClient.put(
      `/crm/v3/objects/deals/${dealId}/associations/contacts/${contactId}`,
      {
        associationCategory: 'HUBSPOT_DEFINED',
        associationTypeId: 3,
      }
    );

    // Associate deal with company
    await hubspotClient.put(
      `/crm/v3/objects/deals/${dealId}/associations/companies/${companyId}`,
      {
        associationCategory: 'HUBSPOT_DEFINED',
        associationTypeId: 1,
      }
    );

    return true;
  } catch (error) {
    console.error('Error associating deal:', error);
    return false;
  }
}
