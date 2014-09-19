# PLP Service: Directory

Portable Linked Profile Directory. This repo will host definitions and implementations for Directories working with PLP

## What is a PLP directory?

PLP Directories add logic around the profiles. They pull profiles from providers and serve them to Browsers. Possible logic could be validation, authentication, notification, etc...

## API

We evaluate [Hydra](http://www.hydra-cg.com/) and [LDP](http://www.w3.org/TR/ldp/), for now simple Level-3 REST

### GET /

status: *implementing*

returns all listings in directory

### POST /

status: *implementing*

adds listing to directory

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
