// Script to convert LinkedIn contacts to a csv file that Anki can load.
// 1. Go to https://www.linkedin.com/mynetwork/invite-connect/connections/
// 2. Press Command+Option-J to open console. (Ctrl-Alt-J on Windows)
// 3. Click in text entry at bottom
// 4. Copy and paste this entire file
// 5. A file called "linkedin-contacts-basic-card.csv" will created and downloaded
// 6. Open Anki and select "Import..."
// 7. Select the "linkedin-contacts-basic-card.csv" file
// 8. Select deck type of "Basic" or "Basic and Reverved Card"
// 9. Click "Import"

// Change this to false if you'd rather have raw fields exported and
// create your own card type:
var exportPreformatted = true;

var connectionCount = parseInt(document.querySelector('header.mn-connections__header').innerText.split(' ')[0])
function scrollPageAndDownloadConnctions() {
    const padding = 5
    const visibleCount = [...document.querySelectorAll('.lazy-image.presence-entity__image.EntityPhoto-circle-5')].length
    console.log(`Scrolling to find connections. ${visibleCount} of ${connectionCount}`)
    if ((visibleCount > 0) && (visibleCount < (connectionCount-padding))) {
        window.scrollBy(0, 2000)
        setTimeout(scrollPageAndDownloadConnctions, 1000)
    }
    else {
        window.scrollBy(0, 5000) // Big jump to finish stragglers
        console.log('Found all connections. Now downloading images.')
        downloadConnections()
    }
}

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

// Func to turn photo urls into data URI's (That don't need internet connection)
function getDataUri(url, callback) {
    return new Promise(resolve => {
        var image = new Image();
        image.setAttribute('crossOrigin', 'anonymous')
        image.onload = function () {
            console.log(`Loading connection photo: ${url}`)
            var canvas = document.createElement('canvas')
            canvas.width = this.naturalWidth
            canvas.height = this.naturalHeight
            canvas.getContext('2d').drawImage(this, 0, 0, 150, 150)
            const imageDataURL = canvas.toDataURL('image/jpeg', 0.2)
            console.log(imageDataURL)
            console.log(
                '%c                       ',
                `min-width:100px;line-height:150px;background-size:150px 150px; background:url(${imageDataURL}) no-repeat;`
            );
            resolve(imageDataURL)
        };
        image.src = url;
    })
}

function downloadConnections() {
    // Get names, occumations, photoTags
    var names = [...document.querySelectorAll('.mn-connection-card__name')].map(x => x.innerHTML.trim())
    var occupations = [...document.querySelectorAll('.mn-connection-card__occupation')].map(x => x.innerHTML.trim())
    var photoTags = [...document.querySelectorAll('.lazy-image.presence-entity__image.EntityPhoto-circle-5')]
    var profileUrls = [...document.querySelectorAll('.mn-connection-card__details a')].map(x => x.href)

    // Create promises for photo downloads
    photoPromises = photoTags.map(
        async (imgTag) => {
            if (!imgTag.src) return Promise.resolve('')
            const dataURI = await getDataUri(imgTag.src)
            return dataURI
        }
    )
    // Wait for photos and then combine all together and download
    Promise.all(photoPromises).then((dataUriArray) => {
        const photos = dataUriArray
        const isoDate = (new Date()).toISOString().slice(0, 10)
        if (exportPreformatted) {
            // Data in formatted HTML, for using Anki "Basic Card"
            allArray = names.map((name, idx) => {
                // Must use backgrond image because anki tries to change host of img tag
                return `<div style="width:150px;height:150px;background-image:url(${photos[idx]})"> </div>\t<h1><a href="${profileUrls[idx]}">${name}</a></h1><p>${occupations[idx]}</p>`
            });
            const csv = allArray.join("\n")
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
        console.log('%cFinished! The .csv file was saved to your downloads folder. Import this into Anki.', 'font-weight: bold; font-size: 16px')
    })

}

// Start it going!
scrollPageAndDownloadConnctions()
