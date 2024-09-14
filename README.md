# TBDex Wallet: Blink

## Overview
TBDex Wallet: Blink is a minimalist, user-friendly wallet application built on the tbDEX protocol. Our MVP focuses on providing seamless currency conversion and fast cross-border payments without the need for users to hold balances in the wallet.

## Application Flow Diagram
The following diagram illustrates the main processes in our application:

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