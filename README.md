# Blink TBDex Wallet:

## Overview
TBDex Wallet: Blink is a minimalist, user-friendly wallet application built on the tbDEX protocol, our web5 wallet application focuses on providing seamless currency conversion and fast cross-border payments, including the management of their business finace through invoice management.



## Key Features
1. Flexible Authentication: 
   - Quick Sign Up for new users with secure DID creation
   - Standard Sign In for existing users
   - Sign Up with existing portable DID for seamless cross-platform experience now users won't need to manage multiple DIDs to use our platform
2. Blink: Instantly convert between fiat and cryptocurrencies using the best available rates from multiple Participating Financial Institutions (PFIs).
3. Smart Invoicing: Generate and share multiple types of invoices (multi-use, one-time, directed) for quick and easy payments.
4. Portable DID: Users can export and import their encrypted portable DID for use across Web5-compatible platforms.
5. Business Integration: Foundation for businesses to use Blink as a payment gateway, with plans for an API service.
6. Multi-Currency Support: Create fiat accounts for local currencies and crypto addresses for easy receipt of payments.
## Application Flow Diagram

```mermaid
flowchart TD
    A[User] --> B{Sign Up / Sign In}
    B -->|New User| C[Create DID]
    B -->|Existing User| D{Authentication Method}
    B -->|Use Portable DID| E[Import Encrypted Portable DID]
    
    C --> F[Store User Data & Encrypted Portable DID]
    D -->|Standard| G[Authenticate]
    E --> H[Verify DID]
    
    G --> F
    H --> F
    F --> I[Display Dashboard]

    I --> J{User Action}
    J -->|Currency Conversion| K[Select Currencies & Amount]
    J -->|Create Invoice| S{Invoice Type}
    J -->|Export DID| Y[Export Encrypted Portable DID]

    K --> L[Fetch Offerings from PFIs]
    L --> M[Display Filtered Offerings]
    M --> N[User Selects Offering]
    N --> O[Create and Send RFQ]
    O --> P[Receive Quote]
    P --> Q{User Confirms?}
    Q -->|Yes| R[Create and Send Order]
    Q -->|No| J
    R --> T[Process Order]
    T --> U[Display Order Status]
    U --> V[Rate Transaction]

    S -->|Multi-use| W1[Generate Reusable Invoice ID]
    S -->|One-time| W2[Generate One-time Invoice ID]
    S -->|Directed| W3[Generate Invoice for Specific User]
    W1 --> X[Display Invoice Details]
    W2 --> X
    W3 --> X

    V --> Z[Store Rating]
    Z --> AA[Update PFI Metrics]

    U --> J
    X --> J
    AA --> J
    Y --> J

    subgraph Future Plans
        AB[API Service for Businesses]
        AC[Use Blink as Payment Gateway]
    end

    AB --> AC
```


## Design Considerations

### Profitability
* Transaction Fees: We charge a small percentage fee on each conversion transaction.
* Premium Features: Future plans include offering premium features for power users and businesses.

### Optionality
* Our application aggregates offerings from multiple PFIs, presenting users with the best available rates.
* Users can view and compare different offerings before making a decision.

### Customer Management
* Decentralized Identifiers (DIDs) are created for each user during the sign-up process and store an encrypted portable version of thier new DID that can be exported and used on other applications that are built on the tbDEX protocol.
* Verifiable Credentials are obtained and securely stored, streamlining the KYC process for future transactions.

### Customer Satisfaction
* Users are prompted to rate transactions upon completion.
* We track and analyze satisfaction metrics to continually improve our service and PFI partnerships.

## Technical Stack
* Frontend: React with Material-UI
* Backend: Laravel (PHP)
* TBD Integration: @tbdex/http-client, @web5/dids



## Future Plans
* Expand business integration capabilities
* Implement advanced analytics for transaction data
* Enhance security features and compliance measures
* Create API services that can be consumed by other business allowing them use are our wallet as a payment option
* A more robus invoicing system to enable customers and business migrate management of their own clients when it comes to finance 



