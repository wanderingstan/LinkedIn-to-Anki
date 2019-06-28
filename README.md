# LinkedIn to Anki Cards

Don't you hate it when you're at a business conference or coffee shop and see someone that you *know* you know, but can't think of their name? 

[Anki](https://apps.ankiweb.net/) is an amazing program for remembering things. This script converts your LinkedIn contacts into Anki "cards" that can be learned. 

What it does is to automatically scroll through your contact page, then extract the name, positions, and photos of your contacts. These are then saved as a tab-separated file that Anki can read. 

So far only tested in Chrome.

(You may want to keep these instructions open in another tab or window while you do the steps.)

1. Go to https://www.linkedin.com/mynetwork/invite-connect/connections/
2. Press Command+Option-J to open console. (Ctrl-Alt-J on Windows)
3. Click in text entry at bottom
4. Copy and paste [this entire file](https://raw.githubusercontent.com/wanderingstan/LinkedIn-to-Anki/master/linkedin-to-csv.js) 
5. A file called "linkedin-contacts-basic-card.csv" will created and downloaded
6. Open Anki and select "Import..."
7. Select the "linkedin-contacts-basic-card.csv" file
8. Select deck type of "Basic" or "Basic and Reverved Card"
9. Click "Import"

## Geeky details

If you're comfortable creating your own card types, on the first line of code change `exportPreformatted` to be false. Then just the raw data fields are exported. 

LinkedIn doesn't like serving images to strange "browsers", so this script converts the contact's image into a data URI, and stores the image directly in the Anki feild.

Anki tries to be "smart" and re-write image tags, so to show an data URI image, it has to be done as a CSS background image. 

I learned some cool tricks along the way, such as finding a script to download a data file from javascript, and learning how to display an image in the chrome console. 
