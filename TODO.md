# bug

debug doesn't work in pzl/shared

sort of a bug where something during image loading, the boy image gets stuck in
a square on one image briefly, dunno why

# TODO stuff

border around pieces
Jigsaw shape
if shape is too small, just go back to straight edges?
hover effect?

konva cache()

focus handling

something on main page, maybe puzzle in background

## Infra

Move frontend to Railway static Railpack SPA

Railway redis cache - for multiple servers but also saves pending games when
server updates

maybe figure out Railway bucket, presign may be supported for public, but have to figure out public presign/get way or setup

btw don't delete s3 on server startup if we have horizontal scaled servers

## hmm

space bar move?

dedicated view image

Drag and drop image selector UI?

multi group snapping?

performance - some things like zoom don't work well in 50x50?

Better error handling?

better client side validation?

testing? lul

## Maybe dunno

image selection gallery + default images. maybe some potential for monetization idk

cloudfront? idk. probably overkill at any point.

initial scale should be based on furthest pieces - not sure about this one
because it's not exactly easy to know when to trigger this calculation. on
initial load? ok. on reset game? maybe. on every snapped piece? probably not. we
can't just put some reactive thing onto game data and call it day.

prevent piece from moving while pinch zooming. This is kind of not really a bug
but kind of an awkward thing to see. don't really have a solution around this for now so just gonna leave it i think
