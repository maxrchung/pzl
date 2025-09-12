# TODO stuff

mobile support pinch and zoom

Jigsaw shape
border around pieces
hover effect

Drag and drop image selector UI

Lobbies?

Start screen

Better error handling?

better client side validation?

testing?

# Scaling

Railway cache if need multiple servers

don't delete s3 on server startup if we have horizontal scaled servers

# Dunno

cloudfront? idk. probably overkill at this point.

initial scale should be based on furthest pieces - not sure about this one
because it's not exactly easy to know when to trigger this calculation. on
initial load? ok. on reset game? maybe. on every snapped piece? probably not. we
can't just put some reactive thing onto game data and call it day.

image selection gallery + default images. maybe some potential for monetization idk
