# TBDex Wallet: Blink


## Overview
TBDex Wallet: Blink is a minimalist, user-friendly wallet application built on the tbDEX protocol. Our MVP focuses on providing seamless currency conversion and fast cross-border payments without the need for users to hold balances in the wallet.

## Diagram
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

    %% Currency Conversion
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

## Key Features
1. **Quick Sign Up / Sign In**: Streamlined user onboarding with secure authentication.
2. **Blink**: Instantly convert between fiat and cryptocurrencies using the best available rates from multiple Participating Financial Institutions (PFIs).
3. **Instant Invoicing**: Generate and share invoices for quick and easy payments.

## Design Considerations

### Profitability
- **Transaction Fees**: We charge a small percentage fee on each conversion transaction.
- **Premium Features**: Future plans include offering premium features for power users and businesses.

### Optionality
- Our application aggregates offerings from multiple PFIs, presenting users with the best available rates.
- Users can view and compare different offerings before making a decision.

### Customer Management
- Decentralized Identifiers (DIDs) are created for each user during the sign-up process.
- Verifiable Credentials are obtained and securely stored, streamlining the KYC process for future transactions.


## Technical Stack
- Frontend: React with Material-UI
- Backend: Laravel (PHP)
- TBD Integration: @tbdex/http-client

## Getting Started
coming soon

