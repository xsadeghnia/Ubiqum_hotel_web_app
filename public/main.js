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
        favouritesMode: false,
        chatMode: false,
        currentPage: 0,
        previousPage: 0,
        selectedHotel: null,
        hotelImages: [],
        facilities: [],
        favArr: [],
        posts: [],
        text: "",
        isLoggedIn: false,
        username: "",
        loading: false,
        favIsSelected: false,
    },
    methods: {
        search: async function () {
            this.loading = true;
            this.previousPage = this.currentPage;
            this.currentPage = 1;
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
            this.loading = false;
        },
        showMoreInfo: async function (hotel) {
            this.previousPage = this.currentPage;
            this.currentPage = 2;
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
            if (i != -1) {
                this.favArr.splice(i, 1);
                this.favIsSelected = false;
                return;
            }
            this.favArr.push(hotel);
            this.favIsSelected = true;

        },
        showFavourites: async function () {
            // this.previousPage = this.currentPage;
            // this.currentPage = 3;
            console.log("fav is clicked!");
            this.moreInfoMode = false;
            this.searchMode = false;
            this.favouritesMode = true;
        },
        closeFav: async function () {
            console.log("current page:" + this.currentPage);
            console.log("previous page:" + this.previousPage);
            if (this.previousPage == 0) {
                this.favouritesMode = false;
            } else if (this.previousPage == 1) {
                this.favouritesMode = false;
                this.searchMode = true;
            } else if (this.previousPage == 2) {
                this.favouritesMode = false;
                this.moreInfoMode = true;
            }
        },
        goBack: async function () {
            if (this.currentPage == 0) {
                this.favouritesMode = false;
            } else if (this.currentPage == 1) {
                this.favouritesMode = false;
                this.searchMode = true;
            } else if (this.currentPage == 2) {
                this.moreInfoMode = false;
                this.searchMode = true;
            }
            var temp = this.previousPage;
            this.previousPage = this.currentPage;
            this.currentPage = temp;
            console.log("back button is clicked!");
            console.log("current page:" + this.currentPage);
            console.log("previous page:" + this.previousPage);
        },
        goHome: async function () {
            this.searchMode = false;
            this.moreInfoMode = false;
            this.favouritesMode = false;
            this.chatMode = false;
        },
        chat: async function () {
            // this.previousPage = this.currentPage;
            // this.currentPage = 4;
            console.log("chat is clicked!");
            this.searchMode = false;
            this.moreInfoMode = false;
            this.favouritesMode = false;
            this.chatMode = true;
            this.getPosts();
        },
        closeChat: async function () {
            if (this.previousPage == 0) {
                this.chatMode = false;
            } else if (this.previousPage == 1) {
                this.chatMode = false;
                this.searchMode = true;
            } else if (this.previousPage == 2) {
                this.chatMode = false;
                this.moreInfoMode = true;
            }
        },
        checkAuthState() {
            firebase.auth().onAuthStateChanged(function (user) {
                console.log(user)
                if (user) {
                    // User is signed in.
                    app.isLoggedIn = true
                    console.log('logged in')

                } else {
                    app.isLoggedIn = false
                    console.log('logged out')
                    // No user is signed in.
                }
            });
        },
        login() {
            var provider = new firebase.auth.GoogleAuthProvider();

            firebase.auth().signInWithPopup(provider)
                .then(function () {
                    app.getPosts();
                })
                .catch(function () {
                    alert("Something went wrong");
                });
        },
        logout() {
            firebase.auth().signOut()
                .then(function () {
                    // Sign-out successful.
                    console.log("user logged out.");
                })
                .catch(function (error) {
                    // An error happened
                    console.log("Something went wrong");
                });
        },
        writeNewPost() {
            var userName = firebase.auth().currentUser.displayName;
            // A post entry.
            var postData = {
                name: userName,
                body: this.text
            };
            // Get a key for a new Post.
            var newPostKey = firebase.database().ref().child('myMatch').push().key;
            var updates = {};
            updates[newPostKey] = postData;
            this.text = "";
            // audio.play();
            return firebase.database().ref().child('myMatch').update(updates);
        },
        getPosts() {
            this.username = firebase.auth().currentUser.displayName
            firebase.database().ref('myMatch').on('value', function (data) {
                app.posts = data.val();
                setTimeout(() => {
                    var container = document.querySelector(".box");
                    var scrollHeight = container.scrollHeight;
                    container.scrollTop = scrollHeight;
                }, 100)
                // var messageDisplay = myVue.$refs.messageDisplay;
                // messageDisplay.scrollTop = messageDisplay.scrollHeight;
            })
        },
        addressConvert(string) {
            return string.split(" ").join("+")
        }
    },
    mounted() {
        this.checkAuthState()
    }
});