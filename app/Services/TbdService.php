<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class TbdService
{
    public function createDid()
    {
        // Implement the logic to create a DID using TBD SDK
        // This is a placeholder and needs to be replaced with actual TBD SDK calls
        return 'did:example:123456789abcdefghi';
    }

    public function getVerifiableCredential($name, $email, $did)
    {
        // This is a mock implementation. Replace with actual API call to the mock identity verifier
        $response = Http::get("https://mock-idv.tbddev.org/kcc", [
            'name' => $name,
            'country' => 'US', 
            'did' => $did
        ]);

        if ($response->successful()) {
            return $response->body();
        }

        throw new \Exception('Failed to get verifiable credential');
    }
}