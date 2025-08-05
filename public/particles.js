tsParticles.load("tsparticles", {
    fullScreen: {
      enable: false,
    },
    background: {
      color: {
        value: "transparent",
      }
    },
    particles: {
      number: {
        value: 120,
        density: {
          enable: true,
          value_area: 800,
        }
      },
      color: {
        value: "#ffffff",
      },
      shape: {
        type: "circle",
      },
      opacity: {
        value: 0.8,
        random: true,
      },
      size: {
        value: 2,
        random: true,
      },
      move: {
        enable: true,
        speed: 0.6,
        direction: "none",
        outMode: "out",
      }
    },
    interactivity: {
      events: {
        onhover: {
          enable: false,
        },
        onclick: {
          enable: false,
        }
      }
    },
    detectRetina: true,
  });
  