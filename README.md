# SPE Front Desk interface

Interface used at front desk to link booking numbers to RFID bracelets

## Overview

Front desk worker logs in using special account, this account has read/write access in firebase. Asks email of visitor, either:

- They signed up at booking terminal and booking is already on screen
- They signed up at home and worker needs to search for email to find booking

Once booking found, connects to scanner and associates any bands scanned with with selected booking.

## How to run

```

```

## TODO

- Interface should show which scanner it is connected to
- Interface should allow removal of RFID
- On search should grey out results which have already linked RFIDs to reduce amount to search
