using System.ComponentModel.DataAnnotations.Schema;

namespace HN_Smart_Hub.Models
{
    public class Employe
    {
        public int Id {get; set;}
        public string Nom {get; set;}
        public string Prenom {get; set;}
        public string Poste {get; set;}
        public bool Actif {get; set;}

        public int UserId {get; set;}

        [ForeignKey("UserId")]
        public User? Compte {get; set;}
    }
}