const baseUrl = "https://serene-castle-24630.herokuapp.com"

Vue.component('tablebox', {
  props: ['shorturls'],
  template:
    `<div>
    <div class="url-table">
        <table>
            <tr>
                <th>Long URL</th>
                <th>Short URL</th>
                <th>Clicks</th>
            </tr>
            <tr v-for="url in shorturls">
                <td>{{ url.fullURL }}</td>
                <td>{{ url.shortURL }}</td>
                <td>{{ url.clicks }}</td>
            </tr>
        </table>
    </div>
  </div>`
})

var app = new Vue({
  el: '#app',
  data: {
    isLoggedIn: false,
    username: "",
    emailid: "",
    password: "",
    url: "",
    shortUrls: []
  },
  mounted() {
    var ref = this;
    if (localStorage.getItem('isloggedin')) {
      const emailid = localStorage.getItem('email');
      this.isLoggedIn = true;
      axios({
        method: 'post',
        url: baseUrl + '/geturls',
        data: Qs.stringify({
          user_email: emailid
        }),
        headers: {
          'content-type': 'application/x-www-form-urlencoded'
        }
      })
        .then(function (response) {
          if (response.status == 200) {
            let shorturls = response.data.urls;
            ref.shortUrls = shorturls;
          }
        });
    }
    else {
      this.isLoggedIn = false;
    }
    if (this.isLoggedIn == false) {
      const sign_in_btn = document.querySelector("#sign-in-btn");
      const sign_up_btn = document.querySelector("#sign-up-btn");
      const container = document.querySelector(".container");

      sign_up_btn.addEventListener("click", () => {
        container.classList.add("sign-up-mode");
      });

      sign_in_btn.addEventListener("click", () => {
        container.classList.remove("sign-up-mode");
      });
    }
  },
  methods: {
    submitLoginForm: function (e) {
      e.preventDefault();
      axios({
        method: 'post',
        url: baseUrl + '/login',
        data: Qs.stringify({
          user_email: this.emailid,
          password: this.password
        }),
        headers: {
          'content-type': 'application/x-www-form-urlencoded'
        }
      })
        .then(function (response) {
          if (response.status == 200) {
            console.log(response);
            localStorage.setItem('isloggedin', true);
            localStorage.setItem('email', response.data.user_email);
            location.reload();
          }
        })
        .catch(error => {
          alert("Please check your username or password!!");
          this.emailid = null;
          this.password = null;
        });
    },
    submitSignUpForm: function (e) {
      e.preventDefault();
      axios({
        method: 'post',
        url: baseUrl + '/signup',
        data: Qs.stringify({
          user_name: this.username,
          user_email: this.emailid,
          password: this.password
        }),
        headers: {
          'content-type': 'application/x-www-form-urlencoded'
        }
      })
        .then(function (response) {
          if (response.status == 200) {
            console.log(response);
            localStorage.setItem('isloggedin', true);
            localStorage.setItem('email', response.data.user_email);
            location.reload();
          }
        })
        .catch(error => {
          alert("Account already exists!!");
          this.username = null;
          this.emailid = null;
          this.password = null;
        });
    },
    submitURLShorten: function (e) {
      e.preventDefault();
      axios({
        method: 'post',
        url: baseUrl + '/urlshorten',
        data: Qs.stringify({
          user_email: localStorage.getItem('email'),
          full_url: this.url
        }),
        headers: {
          'content-type': 'application/x-www-form-urlencoded'
        }
      })
        .then(function (response) {
          if (response.status == 200) {
            location.reload();
          }
        })
        .catch(error => {
          alert("error occured!");
        });
    }
  }
});