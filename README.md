# TBDex Wallet: Blink

## Overview
TBDex Wallet: Blink is a minimalist, user-friendly wallet application built on the tbDEX protocol for the Africa Bitcoin Conference Hackathon. Our MVP focuses on providing seamless currency conversion and fast cross-border payments without the need for users to hold balances in the wallet.

## Key Features
1. Quick Sign Up / Sign In: Streamlined user onboarding with secure authentication and DID creation.
2. Blink: Instantly convert between fiat and cryptocurrencies using the best available rates from multiple Participating Financial Institutions (PFIs).
3. Smart Invoicing: Generate and share invoices for quick and easy payments, including multi-use invoices.
4. Business Integration: Foundation for businesses to use Blink as a payment gateway.
5. Multi-Currency Support: Create fiat accounts for local currencies and crypto addresses for easy receipt of payments.

## Application Flow Diagram

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant TbdService
    participant PFI
    participant TBDEX

    %% Sign Up / Sign In
    User->>Frontend: Enter credentials
    Frontend->>Backend: Send credentials
    Backend->>TbdService: Create DID (for sign up)
    TbdService-->>Backend: Return DID
    Backend->>Backend: Store user data & DID
    Backend-->>Frontend: Return auth token
    Frontend-->>User: Display dashboard

    %% Currency Conversion (Blink)
    User->>Frontend: Select currencies & amount
    Frontend->>TbdService: Get offerings
    TbdService->>TBDEX: Fetch offerings from PFIs
    TBDEX->>PFI: Request offerings
    PFI-->>TBDEX: Provide offerings
    TBDEX-->>TbdService: Return offerings
    TbdService-->>Frontend: Return filtered offerings
    Frontend-->>User: Display offerings
    User->>Frontend: Select offering
    Frontend->>TbdService: Create and send RFQ
    TbdService->>TBDEX: Send RFQ to PFI
    TBDEX->>PFI: Forward RFQ
    PFI-->>TBDEX: Return Quote
    TBDEX-->>TbdService: Return Quote
    TbdService-->>Frontend: Display Quote
    Frontend-->>User: Confirm Quote
    User->>Frontend: Confirm and provide payment details
    Frontend->>TbdService: Create and send Order
    TbdService->>TBDEX: Send Order to PFI
    TBDEX->>PFI: Forward Order
    PFI-->>TBDEX: Process Order
    TBDEX-->>TbdService: Return Order Status
    TbdService-->>Frontend: Update Order Status
    Frontend-->>User: Display Order Status

    %% Invoice Function
    User->>Frontend: Create Invoice
    Frontend->>Backend: Store Invoice
    Backend-->>Frontend: Return Invoice ID
    Frontend-->>User: Display Invoice details and payment options

    %% Transaction Rating
    User->>Frontend: Rate transaction
    Frontend->>Backend: Store rating
    Backend->>Backend: Update PFI satisfaction metrics

```


## Design Considerations

### Profitability
* Transaction Fees: We charge a small percentage fee on each conversion transaction.
* Premium Features: Future plans include offering premium features for power users and businesses.

### Optionality
* Our application aggregates offerings from multiple PFIs, presenting users with the best available rates.
* Users can view and compare different offerings before making a decision.

### Customer Management
* Decentralized Identifiers (DIDs) are created for each user during the sign-up process.
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



## License
This project is open source and available under the [MIT License](LICENSE).