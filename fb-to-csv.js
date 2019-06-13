// Script to convert Facebook friends to a csv file that Anki can load.
// 1. Go to https://www.facebook.com/me/friends
// 2. Scoll down and down and down until all friends are loaded appear.
// 3. Press Command+Option-J to open console. (Ctrl-Alt-J on Windows)
// 4. Click in text entry at bottom
// 5. Copy and paste this entire file
// 6. A file called "fb-friends-basic-card.csv" will created and downloaded
// 7. Open Anki and select "Import..."
// 8. Select the "fb-friends-basic-card.csv" file
// 9. Select deck type of "Basic" or "Basic and Reverved Card"
// 10. Click "Import"

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

// Get all friend DIVs
friendPromises = [...document.querySelectorAll('._698')].map(async (friendDiv) => {
    return {
        'name': friendDiv.querySelector('.fsl').innerText,
        'profileUrl': friendDiv.querySelector('.fsl a').href,
        'imageUrl': friendDiv.querySelector('img').src,
        'imageDataUri': await getDataUri(friendDiv.querySelector('img').src)
    }
})
// Wait for photos and then combine all together and download
Promise.all(friendPromises).then((friendsData) => {
    // Data in formatted HTML, for using Anki "Basic Card"
    friendsHtmlCsv = friendsData.map((friendData, idx) => {
        // Must use backgrond image because anki tries to change host of img tag
        return `<h1><a href="${friendData.profileUrl}">${friendData.name}</a></h1>\t<div style="width:150px;height:150px;background-image:url(${friendData.imageDataUri})"> </div>`
    }).join("\n");
    console.save(friendsHtmlCsv, "fb-friends-basic-card.csv")

    // Advanced: Data in plain csv/tsv form, for use with custom cards
    /*
    friendsDataCsv = friendsData.map((friendData, idx) => {
        return `${friendData.name}\t${friendData.profileUrl}\t${friendData.imageDataUri}`
    }).join("\n");
    console.save(friendsDataCsv, "fb-friends-data.csv")
    */
})
