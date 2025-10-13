# TODO stuff

modal
change sides
change image

slider

space bar move

Start screen

Lobbies?

Jigsaw shape
border around pieces
hover effect

Drag and drop image selector UI

Better error handling?

better client side validation?

testing?

## Infra

Move frontend to Railway static Railpack SPA

Railway cache if need multiple servers

don't delete s3 on server startup if we have horizontal scaled servers

## Maybe dunno

image selection gallery + default images. maybe some potential for monetization idk

cloudfront? idk. probably overkill at any point.

initial scale should be based on furthest pieces - not sure about this one
because it's not exactly easy to know when to trigger this calculation. on
initial load? ok. on reset game? maybe. on every snapped piece? probably not. we
can't just put some reactive thing onto game data and call it day.

prevent piece from moving while pinch zooming. This is kind of not really a bug
but kind of an awkward thing to see. don't really have a solution around this for now so just gonna leave it i think
