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
        favouritesMode : false,
        chatMode : false,
        selectedHotel: null,
        hotelImages: [],
        facilities: [],
        favArr: [],
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
            let newListOfHotles = [];
            for (let i = 0; i < this.destinationInfo.suggestions[0].entities.length; i++) {
                var rowHotelInfo = await fetch('https://hotels4.p.rapidapi.com/properties/list?destinationId=' + this.destinationInfo.suggestions[0].entities[i].destinationId + '&type=CITY&pageNumber=1&pageSize=1&adults1=' + this.adults, options)
                    .then(res => res.json())
                    .then(e => e) // .then(function(e) { return e; })
                    .catch(err => err);
                var results = rowHotelInfo.data.body.searchResults.results;
                for (let j = 0; j < results.length; j++) {
                    let hotelsObjectToShow = {};
                    hotelsObjectToShow.name = results[j].name;
                    hotelsObjectToShow.id = results[j].id;
                    hotelsObjectToShow.pic = results[j].thumbnailUrl;
                    hotelsObjectToShow.rating = results[j].starRating;
                    hotelsObjectToShow.address = results[j].address.streetAddress;
                    if (results[j].ratePlan)
                        hotelsObjectToShow.price = results[j].ratePlan.price.current;
                    newListOfHotles.push(hotelsObjectToShow);
                }
            }
            this.allHotelsInfo = newListOfHotles;
            console.log(this.allHotelsInfo);
            let newFacilities = [];
            let facil = rowHotelInfo.data.body.filters.facilities.items;
            if (facil[9].label)
                newFacilities.push(facil[9].label);
            if (facil[10].label)
                newFacilities.push(facil[10].label);
            if (facil[11].label)
                newFacilities.push(facil[11].label);
            this.facilities = newFacilities;
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
                this.hotelImages.push(images.hotelImages[i].baseUrl.replace('_{size}', ''));
            }
            this.moreInfoMode = true;
        },
        markFavourites: async function (hotel) {
            let i = this.favArr.indexOf(hotel);
            if(i != -1){
                this.favArr.splice(i,1);
                return;
            }
            this.favArr.push(hotel);
        },
        showFavourites : async function(){
            console.log("fav is clicked!");
            this.moreInfoMode =false;
            this.searchMode =false;
            this.favouritesMode = true;
        },
        goBack: async function () {
            this.moreInfoMode = false;
        },
        favBack: async function(){
            this.favouritesMode = false;
            this.searchMode = true;
        },
        goHome : async function(){
            this.searchMode = false;
            this.moreInfoMode = false;
            this.favouritesMode = false;
            this.chatMode = false;
        },
        chat : async function(){
            console.log("chat is clicked!");
            this.searchMode = false;
            this.moreInfoMode = false;
            this.favouritesMode = false;
            this.chatMode = true;
            getPosts();
        },
        closeChat: async function(){
            this.chatMode = false;
        }
    },
});