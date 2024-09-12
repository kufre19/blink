import { TbdexHttpClient } from '@tbdex/http-client';
import { DidDht } from '@web5/dids'



class TbdService {
  constructor() {
    this.client = new TbdexHttpClient();
    this.pfiDids = [
      'did:dht:3fkz5ssfxbriwks3iy5nwys3q5kyx64ettp9wfn1yfekfkiguj1y',
      'did:dht:zkp5gbsqgzn69b3y5dtt5nnpjtdq6sxyukpzo68npsf79bmtb9zy',
      'did:dht:enwguxo8uzqexq14xupe4o9ymxw3nzeb9uug5ijkj9rhfbf1oy5y'
    ];

    this.pfiEndpoints = [
      'https://aqf-mock-pfis.tbddev.org/offerings',
      'https://ff-mock-pfis.tbddev.org/offerings',
      'https://vla-mock-pfis.tbddev.org/offerings'
    ];
  }

  async createDid() {
    try {
      // Create a new  DID
      const didDht = await DidDht.create({ publish: true });
      
      // console.log(didDht);
      return didDht.uri;
    } catch (error) {
      console.error('Error creating DID:', error);
      throw new Error('Failed to create DID');
    }
  }


  async getVerifiableCredential(name, did) {
    const response = await fetch(`https://mock-idv.tbddev.org/kcc?name=${name}&country=US&did=${did}`);
    if (!response.ok) {
      throw new Error('Failed to get verifiable credential');
    }
    return await response.text();
  }

  
  async getOfferingsFromPfi(pfiDid) {
    try {
      const offerings = await this.client.getOfferings({ pfiDid });
      return offerings.filter(offering => this.isValidOffering(offering));
    } catch (error) {
      console.error(`Error fetching offerings from PFI ${pfiDid}:`, error);
      return [];
    }
  }

  isValidOffering(offering) {
    // Check if the offering has all required properties
    return offering &&
           offering.data &&
           offering.data.payin &&
           offering.data.payin.currencyCode &&
           offering.data.payout &&
           offering.data.payout.currencyCode &&
           offering.data.exchangeRate &&
           offering.data.cancellation;
  }

  // async getMatchingOfferings(payinCurrencyCode, payoutCurrencyCode) {
  //   const matchedOfferings = [];

  //   for (const pfiDid of this.pfiDids) {
  //     const offerings = await this.getOfferingsFromPfi(pfiDid);
      
  //     const filteredOfferings = offerings.filter(offering =>
  //       offering.data.payin.currencyCode === payinCurrencyCode &&
  //       offering.data.payout.currencyCode === payoutCurrencyCode
  //     );
      
  //     matchedOfferings.push(...filteredOfferings);
  //   }

  //   return matchedOfferings;
  // }

  async fetchOfferingsFromMockPfi(endpoint) {
    try {
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.data || []; // The offerings are in the 'data' array
    } catch (error) {
      console.error(`Error fetching offerings from ${endpoint}:`, error);
      return [];
    }
  }

  async getMatchingOfferings(payinCurrencyCode, payoutCurrencyCode) {
    const allOfferings = await Promise.all(
      this.pfiEndpoints.map(endpoint => this.fetchOfferingsFromMockPfi(endpoint))
    );

    const matchedOfferings = allOfferings.flat().filter(offering =>
      offering.data.payin.currencyCode === payinCurrencyCode &&
      offering.data.payout.currencyCode === payoutCurrencyCode
    );

    return matchedOfferings;
  }

}

export default new TbdService();