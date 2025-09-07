# pzl

Multiplayer online co-op jigsaw puzzle web game.

<https://pzl.maxrchung.com>

## Debug

Use "Debug all" option in debug tab of VS Code. It launches debug server, client, and
Chrome altogether.

## Amplify

Amplify automatically builds the Vue client on push and deploys as static site.

## CDK

We use S3 to generate presign URLs and upload images. You would think this could
be easily set up through Amplify Storage, but they don't let you have public S3
access. We need public read access so users can indefinitely access images at
permanent locations.

So next I turned to CDK, but I had trouble running CDK with NX. The CDK NX
plugins are either outdated, so don't work with the latest NX, or so opinionated
(@aws/nx-plugin) that it's painful to integrate with even the basic constructs.
I just want a public S3 god damn.

So I ended up just rolling a simple embedded CDK project, which is not standard
but simple enough. You'll need to `cd` into the `cdk` folder to do commands.

## Railway

Railway automatically builds the socket.io server on push and deploys Docker
container.

## Docker Hub

This isn't really necessary since Railway builds the server on push, but if you
want to build and push to Docker Hub you can do this:

```sh
docker build . -t chngmx/pzl
docker push chngmx/pzl
```
