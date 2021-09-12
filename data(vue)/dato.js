// cosas capturadas
let senate = document.getElementById("senate");
// animacion
window.addEventListener('load',()=>{
  const contenedor_loader = document.querySelector('.contenedor')
  contenedor_loader.style.opacity = 0
  contenedor_loader.style.visibility = 'hidden'
})
// fin de la animacion
// uso de vue comiendo general
const app = Vue.createApp({
  data() {
    return {
      datos: [],
      partidos: ["D", "R", "ID"],
      estados: "all",
      statistics: {
        democrats: [],
        republicans: [],
        independents: [],
        averageVotesWithPartyDemocrats: 0,
        averageVotesWithPartyRepublicanos: 0,
        averageVotesWithPartyIndependets: 0,
        averageVotesmissedDemocrats: 0,
        averageVotesmissedRepublicanos: 0,
        averageVotesmissedIndependets: 0,
        totalavergeparty: [],
        totalavergemissed: [],
        mostLoyal: [], //10%
        leastLoyal: [], //10%
        mostEngaged: [], //10%
        leastEngaged: [], //10%
        lealtad: [],
        miembrosconvotos: [],
        filtrado: [],
      },
    };
  },
  //empieza el created
  created() {
    let chamber = senate ? "senate" : "house";
    let init = {
      headers: {
        "X-API-Key": "nFCEqrSBReapQh0vnd5q1JgvrUTqnlopFt4H4Zoi",
      },
    };
    fetch(
      `https://api.propublica.org/congress/v1/113/${chamber}/members.json`,
      init
    )
      .then((e) => e.json())
      .then((dato) => {
        this.datos = dato.results[0].members;
        this.calculopartido(this.datos);
        this.calculardepartido();
        this.filtromiembro();
        this.calculodecompro();
        this.votosconpartidos();
        this.leales();
        this.totalvotos();
        this.totalpartido()
      })
      .catch((erros) => console.error(erros.mensaje));
  },
  //metodos para hacer los calculos
  methods: {
    // separo los miembros
    calculopartido(array) {
      this.statistics.democrats = array.filter(
        (miembro) => miembro.party === "D"
      );
      this.statistics.republicans = array.filter(
        (miembro) => miembro.party === "R"
      );
      this.statistics.independents = array.filter(
        (miembro) => miembro.party === "ID"
      );
    },
    // funciona para poner los votos perdidos de los partidos
    calculardepartido() {
      let voto = function (array) {
        let votosperdidos = array.reduce((acumulador, miembro) => {
          return (acumulador += miembro.missed_votes);
        }, 0);
        votosperdidos = parseFloat((votosperdidos / array.length).toFixed(2));
        return votosperdidos;
      };
      this.statistics.averageVotesmissedDemocrats = voto(
        this.statistics.democrats
      );
      this.statistics.averageVotesmissedRepublicanos = voto(
        this.statistics.republicans
      );
      this.statistics.averageVotesmissedIndependets = voto(
        this.statistics.independents
      );
    },
      // hago lo mismo que arriba pero con lo votos de partidos
    votosconpartidos() {
      let votoconpa = function (array) {
        let totaldevotos = array.reduce((acumulador, member) => {
          return (acumulador += member.votes_with_party_pct);
        }, 0);
        let total = parseFloat((totaldevotos / array.length).toFixed(2));
        return total;
      };
      this.statistics.averageVotesWithPartyDemocrats = votoconpa(
        this.statistics.democrats
      );
      this.statistics.averageVotesWithPartyRepublicanos = votoconpa(
        this.statistics.republicans
      );
      this.statistics.averageVotesWithPartyIndependets = votoconpa(
        this.statistics.independents
      );
    },
    // filtro general para saber si nunca votaron 
    filtromiembro() {
      this.statistics.miembrosconvotos = this.datos.filter(
        (miembro) => miembro.total_votes > 0
      );
    },
    // calculo a los mas comprometidos
    calculodecompro() {
      let miembroporsentaje = Math.round(
        (this.statistics.miembrosconvotos.length * 10) / 100
      );
      this.statistics.miembrosconvotos.sort((a, b) => {
        if (a["missed_votes"] > b["missed_votes"]) {
          return 1;
        }
        if (a["missed_votes"] < b["missed_votes"]) {
          return -1;
        }
        return 0;
      });
      let index = this.statistics.miembrosconvotos.length - miembroporsentaje;
      for (let i = index; i < this.statistics.miembrosconvotos.length; i++) {
        this.statistics.leastEngaged.unshift(
          this.statistics.miembrosconvotos[i]
        );
      }
      for (let i = 0; i < miembroporsentaje; i++) {
        this.statistics.mostEngaged.push(this.statistics.miembrosconvotos[i]);
      }
    },
    // calculos a los mas leales
    leales() {
      let miembroporsentaje = Math.round(
        (this.statistics.miembrosconvotos.length * 10) / 100
      );
      this.statistics.lealtad = this.statistics.miembrosconvotos.sort(
        (a, b) => {
          if (a["votes_against_party_pct"] > b["votes_against_party_pct"]) {
            return 1;
          }
          if (a["votes_against_party_pct"] < b["votes_against_party_pct"]) {
            return -1;
          }
          return 0;
        }
      );
      let index = this.statistics.miembrosconvotos.length - miembroporsentaje;
      for (let i = index; i < this.statistics.miembrosconvotos.length; i++) {
        this.statistics.leastLoyal.unshift(this.statistics.lealtad[i]);
      }
      for (let i = 0; i < miembroporsentaje; i++) {
        this.statistics.mostLoyal.push(this.statistics.miembrosconvotos[i]);
      }
    },
    // calculo el total de los votos perdidos
    totalvotos() {
      this.totalavergeparty = parseFloat(
        (
          (this.statistics.averageVotesmissedDemocrats +
            this.statistics.averageVotesmissedRepublicanos +
            this.statistics.averageVotesmissedIndependets) /
          3
        ).toFixed(2)
      );
    },
    // calculo el total de los votos por partidos
    totalpartido() {
      this.totalavergemissed = parseFloat(
        (
          (this.statistics.averageVotesWithPartyDemocrats +
            this.statistics.averageVotesWithPartyRepublicanos +
            this.statistics.averageVotesWithPartyIndependets) /
          3
        ).toFixed(2)
      );
    },
  },
  // computed para hacer los filtrados
  computed: {
    filtradodecheck() {
      let array = [];
      array = this.datos.filter(
        (dato) =>
          this.partidos.includes(dato.party) &&
          (dato.state === this.estados || this.estados === "all")
      );
      return array;
    },
  },
});
//capturo para el uso de vue
let cosas = app.mount("#app");
