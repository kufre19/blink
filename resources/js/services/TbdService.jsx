import { TbdexHttpClient, Rfq, Order, Close, Quote, OrderStatus } from '@tbdex/http-client';
import { DidDht } from '@web5/dids'
import CryptoJS from 'crypto-js';



class TbdService {
  constructor() {
    // TbdexHttpClient = new TbdexHttpClient();
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
      const didDht = await DidDht.create({ publish: true });
      const portableDid = await didDht.export();

      return {
        didString: didDht.uri,
        portableDid: portableDid
      };
    } catch (error) {
      console.error('Error creating DID:', error);
      throw new Error('Failed to create DID');
    }
  }



  encryptPortableDid(portableDid, password) {
    const portableDidString = JSON.stringify(portableDid);
    return CryptoJS.AES.encrypt(portableDidString, password).toString();
  }

  decryptPortableDid(encryptedPortableDid, password) {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedPortableDid, password);
      const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
      return JSON.parse(decryptedString);
    } catch (error) {
      console.error('Error during decryption:', error);
      throw new Error('Failed to decrypt portable DID: ' + error.message);
    }
  }

  async reconstructDid(portableDid) {
    try {
      return await DidDht.import({ portableDid: portableDid });
    } catch (error) {
      console.error('Error reconstructing DID:', error);
      throw new Error('Failed to reconstruct DID: ' + error.message);
    }
  }

  async testEncryptionDecryption() {
    let password = "password"
    const { didString, portableDid } = await this.createDid();
    console.log(newDid);

    console.log('Original portable DID:', portableDid);
    const encrypted = this.encryptPortableDid(portableDid, password);
    console.log('Encrypted:', encrypted);
    const decrypted = this.decryptPortableDid(encrypted, password);
    console.log('Decrypted:', decrypted);
    return JSON.stringify(portableDid) === JSON.stringify(decrypted);
  }


  async getPortableDid(encryptedPortableDid, password) {
    try {
      const decryptedPortableDid = this.decryptPortableDid(encryptedPortableDid, password);
      console.log('Decrypted portable DID:', decryptedPortableDid);

      if (!decryptedPortableDid || typeof decryptedPortableDid !== 'object') {
        throw new Error('Decrypted data is not a valid object');
      }

      return await DidDht.import(decryptedPortableDid);
    } catch (error) {
      console.error('Error in getPortableDid:', error);
      throw new Error('Failed to get portable DID: ' + error.message);
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
      const offerings = await TbdexHttpClient.getOfferings({ pfiDid });
      return offerings;
    } catch (error) {
      console.error(`Error fetching offerings from PFI ${pfiDid}:`, error);
      return [];
    }
  }

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

  async getMatchingOfferings(payinCurrencyCode, payoutCurrencyCode) {
    const matchedOfferings = [];

    for (const pfiDid of this.pfiDids) {
      const offerings = await this.getOfferingsFromPfi(pfiDid);

      const filteredOfferings = offerings.filter(offering =>
        offering.data.payin.currencyCode === payinCurrencyCode &&
        offering.data.payout.currencyCode === payoutCurrencyCode
      );

      matchedOfferings.push(...filteredOfferings);
    }

    return matchedOfferings;
  }



  // async getMatchingOfferings(payinCurrencyCode, payoutCurrencyCode) {
  //   const allOfferings = await Promise.all(
  //     this.pfiEndpoints.map(endpoint => this.fetchOfferingsFromMockPfi(endpoint))
  //   );

  //   const matchedOfferings = allOfferings.flat().filter(offering =>
  //     offering.data.payin.currencyCode === payinCurrencyCode &&
  //     offering.data.payout.currencyCode === payoutCurrencyCode
  //   );

  //   return matchedOfferings;
  // }



  async createAndSendRfq(selectedOffering, encryptedPortableDid, password, payinDetails, payoutDetails, userName) {
    const portableDid = this.decryptPortableDid(encryptedPortableDid, password);
    const reconstructedDid = await this.reconstructDid(portableDid);

    console.log("pay in details:", payinDetails);
    console.log("pay out details:", payoutDetails);
    // Validate payin details
    const requiredPayinDetails = selectedOffering.data.payin.methods[0].requiredPaymentDetails?.properties || {};
    const validatedPayinDetails = {};
    for (const [key, value] of Object.entries(requiredPayinDetails)) {
      if (payinDetails.paymentDetails[key]) {
        validatedPayinDetails[key] = payinDetails.paymentDetails[key];
      }
    }

    // Validate payout details
    const requiredPayoutDetails = selectedOffering.data.payout.methods[0].requiredPaymentDetails?.properties || {};
    const validatedPayoutDetails = {};
    for (const [key, value] of Object.entries(requiredPayoutDetails)) {
      if (payoutDetails[key]) {
        validatedPayoutDetails[key] = payoutDetails[key];
      }
    }
    const verifiableCredential = await this.getVerifiableCredential(userName, reconstructedDid.uri);


    const rfData = {
      offeringId: selectedOffering.metadata.id,
      payin: {
        kind: selectedOffering.data.payin.methods[0].kind,
        amount: payinDetails.amount,
        paymentDetails: validatedPayinDetails
      },
      payout: {
        kind: selectedOffering.data.payout.methods[0].kind,
        paymentDetails: validatedPayoutDetails
      },
      claims: [verifiableCredential] 
    };

    const rfqToSend = Rfq.create({
      metadata: {
        to: selectedOffering.metadata.from,
        from: reconstructedDid.uri,
        protocol: '1.0'
      },
      data: rfData
    });

    await rfqToSend.sign(reconstructedDid);

    try {
      rfqToSend.verifyOfferingRequirements(selectedOffering);
      await TbdexHttpClient.createExchange(rfqToSend);
      return rfqToSend;
    } catch (e) {
      console.error('RFQ verification failed:', e);
      throw new Error(`RFQ verification failed: ${e.message}`);
    }
  }

  async pollForQuote(pfiDid, customerDid, exchangeId, password) {
    let quote;
    let close;

    const portableDid = this.decryptPortableDid(customerDid, password);
    const reconstructedDid = await this.reconstructDid(portableDid);

    while (!quote && !close) {
      const exchange = await TbdexHttpClient.getExchange({
        pfiDid: pfiDid,
        did: reconstructedDid,
        exchangeId: exchangeId
      });

      quote = exchange.find(msg => msg instanceof Quote);
      close = exchange.find(msg => msg instanceof Close);

      if (!quote && !close) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    return { quote, close };
  }

  async createAndSendOrder(quote, encryptedPortableDid, password) {
    const portableDid = this.decryptPortableDid(encryptedPortableDid, password);
    const reconstructedDid = await this.reconstructDid(portableDid);

    const order = Order.create({
      metadata: {
        from: reconstructedDid.uri,
        to: quote.metadata.from,
        exchangeId: quote.exchangeId,
        protocol: "1.0"
      }
    });

    await order.sign(reconstructedDid);
    await TbdexHttpClient.submitOrder(order);
    return order;
  }

  async pollForOrderStatus(pfiDid, customerDid, exchangeId, password) {
    let close;
    const statusUpdates = [];

    const portableDid = this.decryptPortableDid(customerDid, password);
    const reconstructedDid = await this.reconstructDid(portableDid);

    while (!close) {
      const exchange = await TbdexHttpClient.getExchange({
        pfiDid: pfiDid,
        did: reconstructedDid,
        exchangeId: exchangeId
      });

      for (const message of exchange) {
        if (message instanceof OrderStatus) {
          statusUpdates.push(message.data.orderStatus);
        } else if (message instanceof Close) {
          close = message;
          break;
        }
      }

      if (!close) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    return { statusUpdates, close };
  }

}




export default new TbdService();