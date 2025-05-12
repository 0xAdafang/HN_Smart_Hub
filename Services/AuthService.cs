using BCrypt.Net;
using HN_Smart_Hub.Data;
using HN_Smart_Hub.Models;
using System.Linq;

namespace HN_Smart_Hub.Services
{
    public class AuthService
    {
        private readonly AppDbContext _context;

        public AuthService(AppDbContext context)
        {
            _context = context;
        }

        public User? Login(string username, string password)
        {
            var user = _context.Users.FirstOrDefault(u => u.Username == username);
            if (user != null && BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
            {
                return user;
            }

            return null;
        }

        public void CreateUser(string username, string password, string role)
        {
            var hash = BCrypt.Net.BCrypt.HashPassword(password);
            var user = new User {Username = username, PasswordHash = hash, Role = role};

            _context.Users.Add(user);
            _context.SaveChanges();
        }
    }
}