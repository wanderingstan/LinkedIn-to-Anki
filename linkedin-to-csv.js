// Script to convert LinkedIn contacts to a csv file that Anki can load.
// 1. Go to https://www.linkedin.com/mynetwork/invite-connect/connections/
// 2. Scoll down and down and down until now new contacts appear.
// 3. Press Command+Option-J to open console. (Ctrl-Alt-J on Windows)
// 4. Click in text entry at bottom
// 5. Copy and paste this entire file
// 6. A file called "contacts.csv" will created and downloaded
// 7. Open Anki and select "Import..."
// 8. Select the "contacts.csv" file
// 9. Select deck type of "Basic" or "Basic and Reverved Card"
// 10. Click "Import"

// Change this to false if you'd rather have raw fields exported and
// create your own card type.
var exportPreformatted = true

// Function to download data as a file
(function(console){
    console.save = function(data, filename){
        if(!data) {
            console.error('Console.save: No data')
            return;
        }
        if(!filename) filename = 'console.json'
        if(typeof data === "object"){
            data = JSON.stringify(data, undefined, 4)
        }
        var blob = new Blob([data], {type: 'text/json'}),
            e    = document.createEvent('MouseEvents'),
            a    = document.createElement('a')
        a.download = filename
        a.href = window.URL.createObjectURL(blob)
        a.dataset.downloadurl =  ['text/json', a.download, a.href].join(':')
        e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
        a.dispatchEvent(e)
    }
})(console)
// Get names, occumations, photoTags
const names = [...document.querySelectorAll('.mn-connection-card__name')].map(x=>x.innerHTML.trim())
const occupations = [...document.querySelectorAll('.mn-connection-card__occupation')].map(x=>x.innerHTML.trim())
const photoTags = [...document.querySelectorAll('.lazy-image.presence-entity__image.EntityPhoto-circle-5')]
const profileUrls = [...document.querySelectorAll('.mn-connection-card__details a')].map(x=>x.href)

// Func to turn photo urls into data URI's (That don't need internet connection)
function getDataUri(url, callback) {
    return new Promise(resolve => {
        var image = new Image();
        image.setAttribute('crossOrigin', 'anonymous')
        image.onload = function () {
            console.log(`Loading: ${url}`)
            var canvas = document.createElement('canvas')
            canvas.width = this.naturalWidth
            canvas.height = this.naturalHeight
            canvas.getContext('2d').drawImage(this, 0, 0, 150, 150)
            // Resolve
            resolve(canvas.toDataURL('image/jpeg', 0.2))
        };
        image.src = url;
    })
}
// Create promises for photo downloads
photoPromises=photoTags.map(
    async (imgTag)=>{
        if (!imgTag.src) return Promise.resolve('')
        const dataURI= await getDataUri(imgTag.src)
        return dataURI
    }
)
// Wait for photos and then combine all together and download
Promise.all(photoPromises).then((dataUriArray) => {
    const photos = dataUriArray
    const isoDate = (new Date()).toISOString().slice(0, 10)
    if (exportPreformatted===true) {
        // Data in formatted HTML, for using Anki "Basic Card"
        allArray = names.map((name,idx)=>{
            // Must use backgrond image because anki tries to change host of img tag
            return `<div style="width:150px;height:150px;background-image:url(${photos[idx]})"> </div>\t<h1><a href="${profileUrls[idx]}">${name}</a></h1><p>${occupations[idx]}</p>`
        });
        const csv=allArray.join("\n")
        console.save(csv, `linkedin-contacts-basic-card-${isoDate}.csv`)
    }
    else {
        // Advanced: Data in plain csv/tsv form, for use with custom cards
        allDataArray = names.map((name, idx) => {
            return `${profileUrls[idx]}\t${name}\t${photos[idx]}\t${occupations[idx]}`
        });
        const dataCsv = allDataArray.join("\n")
        console.save(dataCsv, `linkedin-contacts-data-${isoDate}.csv`)
    }
})
