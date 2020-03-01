const app = new Vue({
    el: '#myVue',
    data: {
        //read it from the text-box
        destination: '',
        adults: '',
        destinationInfo: {},
        allHotelsInfo: [],
        searchMode: false,
        moreInfoMode: false,
        selectedHotel: null,
        hotelImages: [],
        slides: [
            // {
            //   title: 'El Teide Volcano, Spain',
            //   content: 'Photo by Max Rive',
            //   // You can also provide a URL for the image.
            //   image:('@/assets/images/el-teide-volcano-spain.jpg')
            // },
            // Other slides.
          ]
    },
    methods: {
        search: async function () {
            const targetURL = 'https://hotels4.p.rapidapi.com/locations/search?query=' + this.destination;
            const options = {
                headers: new Headers({
                    'X-RapidAPI-Key': '7bc5d3d75bmshaaa431d25324017p185f7fjsn46d62344ac27',
                    'X-RapidAPI-Host': 'hotels4.p.rapidapi.com'
                })
            };
            this.destinationInfo = await fetch(targetURL, options)
                .then(res => res.json())
                .then(e => e) // .then(function(e) { return e; })
                .catch(err => err);
            console.log('data has been fetched')
            let newListOfHotles = []
            for (let i = 0; i < this.destinationInfo.suggestions[0].entities.length; i++) {
                let area = await fetch('https://hotels4.p.rapidapi.com/properties/list?destinationId=' + this.destinationInfo.suggestions[0].entities[i].destinationId + '&type=CITY&pageNumber=1&pageSize=1&adults1=' + this.adults, options)
                    .then(res => res.json())
                    .then(e => e.data.body.searchResults.results) // .then(function(e) { return e; })
                    .catch(err => err);
                for (let j = 0; j < area.length; j++) {
                    let hotelsObjectToShow = {};
                    hotelsObjectToShow.name = area[j].name;
                    hotelsObjectToShow.id = area[j].id;
                    hotelsObjectToShow.pic = area[j].thumbnailUrl;
                    hotelsObjectToShow.rating = area[j].starRating;
                    hotelsObjectToShow.address = area[j].address.streetAddress;
                    if (area[j].ratePlan)
                        hotelsObjectToShow.price = area[j].ratePlan.price.current;
                    newListOfHotles.push(hotelsObjectToShow);
                }
            }
            this.allHotelsInfo = newListOfHotles;
            console.log(this.allHotelsInfo);
            this.searchMode = true;
        },
        showMoreInfo: async function (hotel) {
            this.selectedHotel = hotel;
            const options = {
                headers: new Headers({
                    'X-RapidAPI-Key': '7bc5d3d75bmshaaa431d25324017p185f7fjsn46d62344ac27',
                    'X-RapidAPI-Host': 'hotels4.p.rapidapi.com'
                })
            };
            let images = await fetch('https://hotels4.p.rapidapi.com/properties/get-hotel-photos?id=' + this.selectedHotel.id, options)
                .then(res => res.json())
                .then(e => e) // .then(function(e) { return e; })
                .catch(err => err);
                
            for (let i = 0; i < 6; i++) {
                console.log(images.hotelImages[i].baseUrl.replace('_{size}', ''))
                this.hotelImages.push(images.hotelImages[i].baseUrl.replace('_{size}', ''));
            }
            console.log(this.hotelImages)
            this.moreInfoMode = true;
        }
    },
});