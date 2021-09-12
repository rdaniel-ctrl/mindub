const app = Vue.createApp({
  data() {
    return {
      datas: [],
      
    };
  },

  created() {
    let init = {
      headers: {
        "X-API-Key": "nFCEqrSBReapQh0vnd5q1JgvrUTqnlopFt4H4Zoi",
      },
    };
    fetch(
      "https://api.propublica.org/congress/v1/113/senate/members.json",
      init
    )
      .then((e) => e.json())
      .then((dato) => {
        this.datas = dato.results[0].members
        // console.log(dato)
      })
      .then(
        // console.log(this.data.results[0].members)
      )
        
  },
});
app.mount("#app");
