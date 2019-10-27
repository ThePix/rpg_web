To get this to work, you need to first install Node.js

You then need Express (not sure if the second line is needed):

npm install express --save
npm init

For development, I also use nodemon, and the "go" later assumes it is present

npm install -g nodemon

For favicon I used:

npm install serve-favicon

You do not need to do these, but are noted here because this is how the project was created.

npm install express-generator -g
express --view==pug rpg
cd rpg
npm install
npm audit fix

To fire it up, there is a .bat

go

That is all there is to it.