// Récupérer l'utilisateur connecté
const username = localStorage.getItem("username");
const role = localStorage.getItem("role");

document.addEventListener("DOMContentLoaded", () => {
  if (!username || !role) {
    window.location.href = "login.html"; // retour à login si non connecté
    return;
  }

  // Afficher message personnalisé
  document.getElementById("welcomeMessage").textContent = `Bienvenue ${username}`;
  document.getElementById("roleMessage").textContent = `Rôle : ${role}`;

  // Adapter les fonctionnalités selon le rôle
  if (role === "technicien") {
    document.querySelector(".form-section").style.display = "none"; // cacher création de ticket
  }

  if (role === "admin") {
    document.querySelector(".form-section").style.display = "none";

    // Ajout zone stats
    document.querySelector(".tickets-section").insertAdjacentHTML("beforeend", `
      <div style="margin-top:20px; padding:10px; background:#eee">
        <strong>Statistiques : </strong> <span id="stats">0 ticket(s)</span><br><br>
        <label for="filtre">Filtrer par statut :</label>
        <select id="filtre">
          <option value="tous">Tous</option>
          <option value="En attente">En attente</option>
          <option value="En cours">En cours</option>
          <option value="Résolu">Résolu</option>
        </select>
      </div>
    `);

    // Gérer le changement de filtre
    document.getElementById("filtre").addEventListener("change", (e) => {
      const filtre = e.target.value;
      filtrerTickets(filtre);
    });
  }

  // ✅ Charger les tickets existants
  const savedTickets = JSON.parse(localStorage.getItem("tickets")) || [];
  const list = document.getElementById("ticketList");

  savedTickets.forEach(ticket => {
    const item = createTicketElement(ticket);
    list.appendChild(item);
    attachTicketEvents(item);
  });

  updateStats(); // initialiser compteur
});

// Soumission formulaire
document.getElementById("ticketForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const service = document.getElementById("service").value;
  const description = document.getElementById("description").value;
  const priorite = document.getElementById("priorite").value;

  const ticket = {
    service,
    description,
    priorite,
    statut: "En attente",
    date: new Date().toLocaleString()
  };

  // Création et affichage
  const list = document.getElementById("ticketList");
  const item = createTicketElement(ticket);
  list.appendChild(item);
  attachTicketEvents(item);

  saveAllTickets();
  updateStats();
  this.reset();
});

// Fonction : Créer un élément ticket HTML
function createTicketElement(ticket) {
  const item = document.createElement("li");
  item.classList.add("ticket");
  item.innerHTML = `
    <strong>Service :</strong> ${ticket.service}<br>
    <strong>Priorité :</strong> ${ticket.priorite}<br>
    <strong>Description :</strong> ${ticket.description}<br>
    <strong>Statut :</strong> <span class="statut">${ticket.statut}</span><br>
    <em>${ticket.date}</em><br>
    <button class="changer-statut">Changer le statut</button>
    <button class="supprimer-ticket">Supprimer</button>
  `;

  // Style initial
  const statutSpan = item.querySelector(".statut");
  if (ticket.statut === "En cours") statutSpan.style.color = "orange";
  else if (ticket.statut === "Résolu") statutSpan.style.color = "green";

  return item;
}

// Fonction : Attacher les événements aux boutons d’un ticket
function attachTicketEvents(item) {
  const statutBtn = item.querySelector(".changer-statut");
  const statutSpan = item.querySelector(".statut");

  statutBtn.addEventListener("click", () => {
    let current = statutSpan.textContent;

    if (current === "En attente") {
      statutSpan.textContent = "En cours";
      statutSpan.style.color = "orange";
    } else if (current === "En cours") {
      statutSpan.textContent = "Résolu";
      statutSpan.style.color = "green";
      statutBtn.disabled = true;
    }

    saveAllTickets();
    updateStats();
  });

  const supprimerBtn = item.querySelector(".supprimer-ticket");
  supprimerBtn.addEventListener("click", () => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce ticket ?")) {
      item.remove();
      updateStats();
      saveAllTickets();
    }
  });
}

// Fonction : Sauvegarder tous les tickets
function saveAllTickets() {
  const tickets = [];
  document.querySelectorAll(".ticket").forEach(item => {
    const service = item.querySelector("strong:nth-of-type(1)").nextSibling.textContent.trim();
    const priorite = item.querySelector("strong:nth-of-type(2)").nextSibling.textContent.trim();
    const description = item.querySelector("strong:nth-of-type(3)").nextSibling.textContent.trim();
    const statut = item.querySelector(".statut").textContent.trim();
    const date = item.querySelector("em").textContent.trim();

    tickets.push({ service, priorite, description, statut, date });
  });

  localStorage.setItem("tickets", JSON.stringify(tickets));
}

// Fonction : Mise à jour des stats (admin)
function updateStats() {
  if (role === "admin") {
    const total = document.querySelectorAll(".ticket").length;
    document.getElementById("stats").textContent = `${total} ticket(s) au total`;
  }
}

// 💡 Fonction : filtrer les tickets affichés par statut
function filtrerTickets(filtre) {
  const tickets = document.querySelectorAll(".ticket");
  tickets.forEach(ticket => {
    const statut = ticket.querySelector(".statut").textContent.trim();
    if (filtre === "tous" || filtre === statut) {
      ticket.style.display = "block";
    } else {
      ticket.style.display = "none";
    }
  });
}
