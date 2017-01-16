# Mendix Mobile Pincode + TouchID Locking

This package contains 4 widgets to help support a mobile project with pin code or fingerprint (Apple TouchID) login.

The package contains:
- Mobile Pin Code Lock
- Mobile Pin Code Prompt
- Mobile Save Session
- Mobile Retrieve Session

## Mobile Pin Code Lock

Locks the screen with a pin prompt or TouchID either when the widget loads, or when your app goes to sleep (going to the background or locking the screen).

## Mobile Pin Code Prompt

Similar to the lock in functionality, except it's used to set a pin code.

## Mobile Save Session

Used to save a GUID for a user's session that is stored locally on the device and can be used by the Mobile Retrieve Session widget to log a user back into the Mendix app

## Mobile Retrieve Session

Retrieves a GUID stored by the Mobile Save Session, uses it to log the user into their Mendix app, and redirects to the user's home page.

NOTE: these 2 session widgets also rely on other Java code. This will be added to the test project soon.
