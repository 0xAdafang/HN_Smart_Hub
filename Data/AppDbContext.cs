using Microsoft.EntityFrameworkCore;
using HN_Smart_Hub.Models;


namespace HN_Smart_Hub.Data 
{
    public class AppDbContext : DbContext
    {
        public DbSet<User> Users {get; set;}
        public DbSet<Employe> Employes {get; set;}
        public DbSet<IndicateurRH> IndicateursRH {get; set;}

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseNpgsql("Host=localhost;Port=5432;Database=hn_smart_bdd;Username=postgres;Password=Aqwpmn963!");
        }
    }


}