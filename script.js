const root = document.documentElement;
const savedTheme = localStorage.getItem("theme") || "dark";

root.setAttribute("data-theme", savedTheme);

function setupThemeToggle() {
  const themeToggle = document.getElementById("themeToggle");
  const themeLabel = document.querySelector(".theme-label");

  function updateThemeButton(theme) {
    const isLight = theme === "light";
    themeLabel.textContent = isLight ? "Claro" : "Escuro";
    themeToggle.setAttribute(
      "aria-label",
      isLight ? "Alternar para modo escuro" : "Alternar para modo claro",
    );
  }

  if (!themeToggle || !themeLabel) return;

  updateThemeButton(savedTheme);

  themeToggle.addEventListener("click", () => {
    const currentTheme = root.getAttribute("data-theme") || "dark";
    const nextTheme = currentTheme === "dark" ? "light" : "dark";

    root.setAttribute("data-theme", nextTheme);
    localStorage.setItem("theme", nextTheme);
    updateThemeButton(nextTheme);
  });
}

function setupMobileMenu() {
  const menuToggle = document.getElementById("menuToggle");
  const navMenu = document.getElementById("navMenu");

  function closeMenu() {
    if (!navMenu || !menuToggle) return;
    navMenu.classList.remove("open");
    menuToggle.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  }

  if (!menuToggle || !navMenu) return;

  menuToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("open");
    menuToggle.classList.toggle("open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  document.querySelectorAll(".links-nav a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("click", (event) => {
    if (
      navMenu.classList.contains("open") &&
      !navMenu.contains(event.target) &&
      !menuToggle.contains(event.target)
    ) {
      closeMenu();
    }
  });
}

function validateEmail(value) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(value);
}

function validatePhone(value) {
  const digits = value.replace(/\D/g, "");
  return digits.length === 10 || digits.length === 11;
}

function formatPhone(value) {
  const digits = value.replace(/\D/g, "");

  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

function setupFormValidation() {
  const orcamentoForm = document.getElementById("orcamento-form");
  const formFeedback = document.getElementById("formFeedback");
  const emailInput = document.querySelector('input[name="email"]');
  const telefoneInput = document.querySelector('input[name="telefone"]');
  const emailError = document.getElementById("emailError");
  const phoneError = document.getElementById("phoneError");

  function showError(message) {
    formFeedback.textContent = message;
    formFeedback.classList.add("visible");
  }

  function clearError() {
    formFeedback.textContent = "";
    formFeedback.classList.remove("visible", "success");
  }

  function showFieldError(field, message) {
    if (!field) return;
    field.textContent = message;
    field.classList.add("visible");
  }

  function clearFieldError(field) {
    if (!field) return;
    field.textContent = "";
    field.classList.remove("visible");
  }

  function clearFieldErrors() {
    clearFieldError(emailError);
    clearFieldError(phoneError);
  }

  if (!orcamentoForm || !formFeedback) return;

  if (telefoneInput) {
    telefoneInput.addEventListener("input", () => {
      telefoneInput.value = formatPhone(telefoneInput.value);
      clearFieldError(phoneError);
      clearError();
    });

    telefoneInput.addEventListener("blur", () => {
      if (telefoneInput.value && !validatePhone(telefoneInput.value)) {
        showFieldError(
          phoneError,
          "Telefone inválido. Digite o DDD e o número corretamente.",
        );
      }
    });
  }

  if (emailInput) {
    emailInput.addEventListener("input", () => {
      clearFieldError(emailError);
      clearError();
    });

    emailInput.addEventListener("blur", () => {
      if (emailInput.value && !validateEmail(emailInput.value)) {
        showFieldError(
          emailError,
          "Email inválido. Verifique o formato e tente novamente.",
        );
      }
    });
  }

  orcamentoForm.addEventListener("submit", function (event) {
    event.preventDefault();
    clearError();
    clearFieldErrors();

    const nome = this.nome.value.trim();
    const email = this.email.value.trim();
    const telefone = this.telefone.value.trim();
    const descricao = this.descricao.value.trim();

    if (!nome) {
      showError("Por favor, informe seu nome.");
      return;
    }

    if (!validateEmail(email)) {
      showFieldError(emailError, "Por favor, informe um email válido.");
      return;
    }

    if (!validatePhone(telefone)) {
      showFieldError(phoneError, "Por favor, informe um telefone válido com DDD.");
      return;
    }

    if (!descricao) {
      showError("Por favor, informe a descrição da sua ideia.");
      return;
    }

    const formData = new FormData(this);

    fetch(this.action, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: formData,
    })
      .then((response) => {
        if (!response.ok) throw new Error("Network response was not ok");
        return response.json().catch(() => ({ success: true }));
      })
      .then((data) => {
        if (data.success || data.success === undefined) {
          formFeedback.textContent =
            "Obrigado! Sua solicitação foi enviada com sucesso. Entraremos em contato em breve.";
          formFeedback.classList.add("visible", "success");
          this.reset();
          resetProjectType();
          return;
        }

        showError("Não foi possível enviar. Tente novamente mais tarde.");
      })
      .catch(() => {
        showError(
          "Não foi possível enviar. Verifique sua conexão e tente novamente.",
        );
      });
  });
}

const tipoDescricoes = {
  "Aplicativo Móvel":
    "App para celular com foco em vendas, agendamento ou serviços mobile.",
  "Site / Landing Page":
    "Página na internet para apresentação da sua empresa ou oferta.",
  "Sistema Web": "Plataforma online para gestão e controle de processos internos.",
  "QA / Testes": "Avaliação da qualidade do seu software para reduzir erros e bugs.",
};

function resetProjectType() {
  const tipoProjeto = document.getElementById("tipoProjeto");
  const tipoHelp = document.getElementById("tipoHelp");
  const projectCards = document.querySelectorAll(".project-card");
  const defaultValue = "Aplicativo Móvel";

  projectCards.forEach((card) => {
    card.classList.toggle("active", card.dataset.value === defaultValue);
  });

  if (tipoProjeto) tipoProjeto.value = defaultValue;
  if (tipoHelp) tipoHelp.textContent = tipoDescricoes[defaultValue];
}

function setupProjectCards() {
  const tipoProjeto = document.getElementById("tipoProjeto");
  const tipoHelp = document.getElementById("tipoHelp");
  const projectCards = document.querySelectorAll(".project-card");

  if (!tipoProjeto || !tipoHelp) return;

  projectCards.forEach((card) => {
    card.addEventListener("click", () => {
      const selectedValue = card.dataset.value;
      if (!selectedValue) return;

      projectCards.forEach((item) => item.classList.remove("active"));
      card.classList.add("active");
      tipoProjeto.value = selectedValue;
      tipoHelp.textContent =
        tipoDescricoes[selectedValue] ||
        "Escolha um tipo de projeto para ver mais detalhes.";
    });
  });
}

setupThemeToggle();
setupMobileMenu();
setupFormValidation();
setupProjectCards();
