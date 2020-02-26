const app = new Vue({
    el : '#myVue',
    data:{
        //read it from the text-box
        destination : '',
        adults : '',
        destinationInfo:{},
        allHotelsInfo : [],
        loading: true,
        presentMode : false,
    },
    methods:{
        search: async function() {
            this.loading = true;
            const targetURL ='https://hotels4.p.rapidapi.com/locations/search?query='+this.destination;
            const options = {
                headers: new Headers({'X-RapidAPI-Key': '7bc5d3d75bmshaaa431d25324017p185f7fjsn46d62344ac27',
                                      'X-RapidAPI-Host':'hotels4.p.rapidapi.com'})
            };
            this.destinationInfo = await fetch(targetURL, options)
            .then(res => res.json())
            .then(e => e) // .then(function(e) { return e; })
            .catch(err => err);
            console.log('data has been fetched')
            let newListOfHotles = []
            for (let i = 0; i < this.destinationInfo.suggestions[0].entities.length; i++) {
                
                let area = await fetch('https://hotels4.p.rapidapi.com/properties/list?destinationId='+this.destinationInfo.suggestions[0].entities[i].destinationId+'&type=CITY&pageNumber=1&pageSize=2&adults1='+this.adults, options)
                .then(res => res.json())
                .then(e => e.data.body.searchResults.results) // .then(function(e) { return e; })
                .catch(err => err);
                for (let j = 0; j < area.length; j++) {
                    let hotelsObjectToShow = {};
                    hotelsObjectToShow.name = area[j].name;
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
            this.presentMode = true;
            this.loading = false;
        }
    },
});