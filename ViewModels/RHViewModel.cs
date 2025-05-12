using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using HN_Smart_Hub.Data;
using HN_Smart_Hub.Models;
using System.Windows.Input;
using System.Collections.ObjectModel;
using System.Windows;
using HN_Smart_Hub.Helpers;


namespace HN_Smart_Hub.ViewModels
{
    public class RHViewModel : INotifyPropertyChanged
    {
        public event PropertyChangedEventHandler? PropertyChanged;

        private readonly User _utilisateur;
        public ObservableCollection<IndicateurRH> ListeIndicateurs {get; set;} = new();

        public bool EstAdmin => _utilisateur.Role == "admin";

        public ICommand AjouterCommand { get; }
        public ICommand ModifierCommand { get; }
        public ICommand SupprimerCommand { get; }

        public IndicateurRH? IndicateurSelectionne { get; set; }


        public RHViewModel(User utilisateur)
        {
            _utilisateur = utilisateur;
            ChargerIndicateurs();

            AjouterCommand = new RelayCommand(ExecuterAjout, () => EstAdmin);
            ModifierCommand = new RelayCommand(ExecuterModification, () => EstAdmin && IndicateurSelectionne != null);
            SupprimerCommand = new RelayCommand(ExecuterSuppression, () => EstAdmin && IndicateurSelectionne != null);
        }

        private void ChargerIndicateurs()
        {
            using var db = new AppDbContext();

            if (EstAdmin)
            {
                ListeIndicateurs = new ObservableCollection<IndicateurRH>(
                    db.IndicateursRH
                        .Include(i => i.Employe)
                        .OrderBy(i => i.Employe.Nom)
                        .ToList()
                );
            }
            else
            {
                var employe = db.Employes.FirstOrDefault(e => e.UserId == _utilisateur.Id);
                if (employe != null)
                {
                    ListeIndicateurs = new ObservableCollection<IndicateurRH>(
                        db.IndicateursRH
                            .Include(i => i.Employe)
                            .Where(i => i.EmployeId == employe.Id)
                            .ToList()
                    );
                }
            }
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(nameof(ListeIndicateurs)));
        }

        private void ExecuterAjout()
        {
            MessageBox.Show("Fenetre d'ajout à venir !");
        }
        private void ExecuterModification()
        {
            if (IndicateurSelectionne == null) return;
            MessageBox.Show($"Modifier : {IndicateurSelectionne.Employe.Prenom} {IndicateurSelectionne.Employe.Nom}");

        }

        private void ExecuterSuppression()
        {
            if (IndicateurSelectionne == null) return;
            
            var result = MessageBox.Show("Confirmer la suppresion ?", "Confirmation", MessageBoxButton.YesNo);
            if (result == MessageBoxResult.Yes)
            {
                using var db = new AppDbContext();
                var aSupprimer = db.IndicateursRH.Find(IndicateurSelectionne.Id);
                if(aSupprimer != null)
                {
                    db.IndicateursRH.Remove(aSupprimer);
                    db.SaveChanges();
                }

                ChargerIndicateurs();
            }
        }
    }    
}