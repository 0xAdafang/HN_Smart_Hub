using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HN_Smart_Hub.Models
{
    public class IndicateurRH
    {
        public int Id { get; set; }
        
        [ForeignKey("Employe")]
        public int EmployeId { get; set; }

        public Employe Employe {get; set;}

        [Range(0, 10)] public int Ponctualite { get; set;}
        [Range(0, 10)] public int Assiduite {get; set;}
        [Range(0, 10)] public int ServiceClient {get; set;}
        [Range(0, 10)] public int Outils {get; set;}
        [Range(0, 10)] public int RespectConsignes {get; set;}
        [Range(0, 10)] public int Rendement {get; set;}

        public string? Redressements {get; set;}
        public string? Consequences {get; set;}

        public DateTime DateEvaluation {get; set;}
    }
}