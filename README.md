# PLP Service: Directory

Portable Linked Profile Directory. This repo will host definitions and implementations for Directories working with PLP

## What is a PLP directory?

PLP Directories add logic around the profiles. They pull profiles from providers and serve them to Browsers. Possible logic could be validation, authentication, notification, etc...

## API

Supports CORS ([Cross-Origin Resource Sharing](http://enable-cors.org/))

We evaluate [Hydra](http://www.hydra-cg.com/) and [LDP](http://www.w3.org/TR/ldp/), for now simple Level-3 REST

### GET /

status: *implementing*

returns all listings in directory

content-type: *application/ld+json* (or not recommended *application/json*)

response: *JSON-LD object with graph including all listings each with embeded profile*

```js
{
  "@context": "http://plp.hackers4peace.net/context.jsonld",
  "@graph": [
    {
      "@id": "http://directory-domain.tld/faa52ac0-c9f5-4b8c-be1c-4480f353315f"
      "@type": "Listing",
      "about": {
        "@id": "http://provider-domain.tld/449b829a-0fbd-420a-bbe4-70d11527d62b",
        "@type": "Person",
        "name": "Alice Wonder",
        ...
      }
    },
    {
      "@id": "http://directory-domain.tld/a43057b8-134f-49a4-991a-bf910f0803e9"
      "@type": "Listing",
      "about": {
        "@id": "http://provider-domain.tld/11055695-8a65-4284-a6e7-ab96884e7658",
        "@type": "Person",
        "name": "Bob Secure",
        ...
      }
    },
    ...
  ]
}
```

### POST /

status: *implementing*

adds listing to directory

content-type: *application/ld+json* (or not recommended *application/json*)

response: *JSON-LD object with URI of newly created listing based on
directory's domain name and generated [UUID](http://en.wikipedia.org/wiki/Universally_unique_identifier)*

```js
{
  "@context": "http://plp.hackers4peace.net/context.jsonld",
  "@id": "http://domain.tld/faa52ac0-c9f5-4b8c-be1c-4480f353315f",
  "@type": "Listing"
 }
```

### GET /:uuid

status: *planned*

gets single listing

### PUT /:uuid

status: *planned*

requests update of a listing

### DELETE /:uuid

status: *planned*

requests deletion of a listing


## Setup

```bash
$ cp config.example.js config.js
```

edit *config.js* to specify your domain and port

```bash
$ npm install
$ grunt
```

## Unlicense

This is free and unencumbered software released into the public domain.

Anyone is free to copy, modify, publish, use, compile, sell, or
distribute this software, either in source code form or as a compiled
binary, for any purpose, commercial or non-commercial, and by any
means.

In jurisdictions that recognize copyright laws, the author or authors
of this software dedicate any and all copyright interest in the
software to the public domain. We make this dedication for the benefit
of the public at large and to the detriment of our heirs and
successors. We intend this dedication to be an overt act of
relinquishment in perpetuity of all present and future rights to this
software under copyright law.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

For more information, please refer to <http://unlicense.org/>
