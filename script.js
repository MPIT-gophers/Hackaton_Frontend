const featureData = {
  automation: {
    items: [
      {
        title: 'Autofill responses with precision.',
        lead: 'Autofill responses with precision. ',
        body: 'Instantly answer up to 95% of questions accurately, freeing teams from repetitive drafting.'
      },
      {
        title: 'Ground every answer in evidence.',
        lead: 'Ground every answer in evidence. ',
        body: 'Trace source language, preserve context, and keep every response review-ready for customer-facing teams.'
      },
      {
        title: 'Accelerate review cycles.',
        lead: 'Accelerate review cycles. ',
        body: 'Route questions to the right experts, highlight answer quality, and move from draft to approval without chaos.'
      },
      {
        title: 'Protect sensitive workflows.',
        lead: 'Protect sensitive workflows. ',
        body: 'Support enterprise controls like approval states, access boundaries, and customer-specific answer handling.'
      }
    ]
  },
  document: {
    items: [
      {
        title: 'Summarize complex documents instantly.',
        lead: 'Summarize complex documents instantly. ',
        body: 'Condense lengthy RFPs into clear, actionable briefings in seconds—so teams never waste days reading.'
      },
      {
        title: 'Identify risks before they cost you.',
        lead: 'Identify risks before they cost you. ',
        body: 'Surface red flags, missing answers, and unusual clauses early so teams can respond faster and with fewer escalations.'
      },
      {
        title: 'Qualify opportunities in real time.',
        lead: 'Qualify opportunities in real time. ',
        body: 'Turn incoming documents into structured signals that help go-to-market teams focus on the highest-value deals.'
      },
      {
        title: 'Uncover market and customer insights.',
        lead: 'Uncover market and customer insights. ',
        body: 'Spot recurring buyer requests, competitor patterns, and content gaps to strengthen your next response.'
      }
    ]
  },
  collaboration: {
    items: [
      {
        title: 'Collaborate without limits.',
        lead: 'Collaborate without limits. ',
        body: 'Invite as many teammates as needed—no per-seat pricing or access barriers. Everyone can contribute instantly.'
      },
      {
        title: 'Review and approve faster.',
        lead: 'Review and approve faster. ',
        body: 'Keep experts focused on the answers that need them, while the rest of the team tracks approvals in one shared flow.'
      },
      {
        title: 'Edit and comment in real time.',
        lead: 'Edit and comment in real time. ',
        body: 'Work together inside a single response workspace with instant visibility into edits, ownership, and feedback.'
      },
      {
        title: 'Track progress with full visibility.',
        lead: 'Track progress with full visibility. ',
        body: 'See what is complete, blocked, approved, or waiting on review so nothing slips during active deal cycles.'
      }
    ]
  }
};

const testimonials = [
  {
    quote: '“With Anchor, our AEs can handle requests independently and turn them around dramatically faster.”',
    name: 'Davidi Mukhtar',
    role: 'Sr. Director Product Marketing',
    body:
      'Papaya’s sales and pre-sales teams replaced a legacy RFP tool with Anchor to eliminate expert bottlenecks and accelerate deal velocity. With more than 70 users now collaborating in one shared workspace, they’ve achieved 10× faster response cycles and seamless cross-team execution.',
    companyLogo: 'assets/testimonial-logo-papaya.png',
    avatar: 'assets/testimonial-avatar-1.png',
    stats: [
      { label: 'Faster response cycles', value: '10x' },
      { label: 'Active users across departments', value: '70' }
    ]
  },
  {
    quote: '“Anchor’s flexibility to adapt around our evolving workflows has been key.”',
    name: 'Shiran Wolfman',
    role: 'Compliance Officer & DPO',
    body:
      'Starting with just three users in the compliance team, Coralogix is quickly scaling across compliance and solution engineering. As RFPs became a strategic go-to-market initiative, Anchor proved critical in standardizing and accelerating response cycles across teams.',
    companyText: 'Coralogix',
    initials: 'SW',
    stats: [{ label: 'Reduction in turnaround time', value: '85%' }]
  },
  {
    quote: '“Anchor transformed how our team responds to deeply technical content.”',
    name: 'Dor Perry',
    role: 'Sr. Director R&D',
    body:
      'Bruker’s complex RFPs often include hundreds of technical questions requiring input from senior engineers. With Anchor, the team cut response effort by over 60% and achieved 97.5% accuracy on generated answers—dramatically improving speed and quality.',
    companyText: 'Bruker',
    initials: 'DP',
    stats: [
      { label: 'Faster RFP completion', value: '60%' },
      { label: 'Answer accuracy', value: '97.5%' }
    ]
  },
  {
    quote: '“Anchor was the only solution that made true multilingual collaboration happen automatically.”',
    name: 'Michelle Walker',
    role: 'Director, Audit, Due Diligence & Compliance',
    body:
      'BioCatch evaluated multiple RFP tools and found Anchor the only solution capable of handling deeply complex, inconsistent RFI formats. Anchor produced clean, editable drafts within minutes and unlocked true multilingual collaboration across global teams.',
    companyText: 'BioCatch',
    initials: 'MW',
    stats: [
      { label: 'Faster time-to-first-draft versus legacy tooling', value: '100x' },
      { label: 'Seamless multi-language collaboration', value: 'Yes' }
    ]
  },
  {
    quote: '“Automating repetitive vendor portal submissions made my work much more efficient.”',
    name: 'Zach Ahrak',
    role: 'Product & Data Protection Legal Counsel, DPO, GRC, and AI',
    body:
      'By automating repetitive vendor-portal submissions, Anchor freed Coralogix’s marketing and ops teams from manual entry work—delivering a faster, cleaner response process that scaled effortlessly with volume.',
    companyText: 'Coralogix',
    initials: 'ZA',
    stats: [
      { label: 'Automation of vendor-portal flows', value: '100%' },
      { label: 'Reduction in manual tasks', value: 'Significant' }
    ]
  }
];

const securityItems = [
  {
    title: 'End-to-end Encryption',
    body: 'Customer data is encrypted in transit and at rest.'
  },
  {
    title: 'Zero Data Retention',
    body: 'Sensitive model interactions can be configured to avoid persistent retention beyond the processing window required for the response workflow.'
  },
  {
    title: 'Access Controls',
    body: 'Granular workspace permissions ensure reviewers, experts, and admins only see the information and actions relevant to their role.'
  },
  {
    title: 'Data Isolation',
    body: 'Separate customer contexts, knowledge sources, and answer histories stay partitioned for auditability and operational confidence.'
  },
  {
    title: 'Compliant by Design',
    body: 'Built-in approval trails, answer provenance, and review checkpoints help teams operate inside compliance-heavy buying environments.'
  },
  {
    title: 'Secure and Scalable Architecture',
    body: 'Enterprise infrastructure, monitored workloads, and resilient service boundaries support high-volume response operations without sacrificing control.'
  }
];

function renderFeaturePanels() {
  document.querySelectorAll('[data-feature-panel]').forEach((panel) => {
    const key = panel.dataset.featurePanel;
    const config = featureData[key];
    if (!config) return;

    const copyLead = panel.querySelector('.panel__copy strong');
    const copyBody = panel.querySelector('.panel__copy span');
    const tablist = panel.querySelector('.panel__tabs');
    let activeIndex = 0;

    const update = (index) => {
      activeIndex = index;
      copyLead.textContent = config.items[index].lead;
      copyBody.textContent = config.items[index].body;
      Array.from(tablist.children).forEach((button, buttonIndex) => {
        button.classList.toggle('is-active', buttonIndex === activeIndex);
        button.setAttribute('aria-selected', String(buttonIndex === activeIndex));
        button.tabIndex = buttonIndex === activeIndex ? 0 : -1;
      });
    };

    config.items.forEach((item, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'panel__tab';
      button.setAttribute('role', 'tab');
      button.innerHTML = `<span class="panel__tab-title">${item.title}</span>`;
      button.addEventListener('click', () => update(index));
      tablist.appendChild(button);
    });

    update(0);
  });
}

function renderTestimonials() {
  const quoteEl = document.querySelector('[data-testimonial-quote]');
  const nameEl = document.querySelector('[data-testimonial-name]');
  const roleEl = document.querySelector('[data-testimonial-role]');
  const bodyEl = document.querySelector('[data-testimonial-body]');
  const statsEl = document.querySelector('[data-testimonial-stats]');
  const companyEl = document.querySelector('[data-testimonial-company]');
  const avatarEl = document.querySelector('[data-testimonial-avatar]');
  const dotsEl = document.querySelector('[data-testimonial-dots]');
  const prevButton = document.querySelector('[data-testimonial-prev]');
  const nextButton = document.querySelector('[data-testimonial-next]');

  if (!quoteEl || !nameEl || !roleEl || !bodyEl || !statsEl || !companyEl || !avatarEl || !dotsEl) return;

  let activeIndex = 0;

  const update = (index) => {
    activeIndex = (index + testimonials.length) % testimonials.length;
    const item = testimonials[activeIndex];

    quoteEl.textContent = item.quote;
    nameEl.textContent = item.name;
    roleEl.textContent = item.role;
    bodyEl.textContent = item.body;

    avatarEl.innerHTML = '';
    if (item.avatar) {
      const img = document.createElement('img');
      img.src = item.avatar;
      img.alt = '';
      avatarEl.appendChild(img);
    } else {
      avatarEl.textContent = item.initials || item.name.split(' ').slice(0, 2).map((part) => part[0]).join('');
    }

    companyEl.innerHTML = '';
    if (item.companyLogo) {
      const img = document.createElement('img');
      img.src = item.companyLogo;
      img.alt = '';
      companyEl.appendChild(img);
    } else {
      const text = document.createElement('span');
      text.textContent = item.companyText || '';
      companyEl.appendChild(text);
    }

    statsEl.innerHTML = item.stats
      .map(
        (stat) => `
          <div class="testimonial-stat">
            <span class="testimonial-stat__label">${stat.label}</span>
            <div class="testimonial-stat__value">${stat.value}</div>
          </div>
        `
      )
      .join('');

    Array.from(dotsEl.children).forEach((button, buttonIndex) => {
      button.classList.toggle('is-active', buttonIndex === activeIndex);
      button.setAttribute('aria-label', `Go to testimonial ${buttonIndex + 1}`);
    });
  };

  testimonials.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'testimonial-dot';
    dot.addEventListener('click', () => update(index));
    dotsEl.appendChild(dot);
  });

  prevButton?.addEventListener('click', () => update(activeIndex - 1));
  nextButton?.addEventListener('click', () => update(activeIndex + 1));

  update(0);
}

function renderAccordion() {
  const root = document.querySelector('[data-accordion]');
  if (!root) return;

  let openIndex = 0;

  const draw = () => {
    root.innerHTML = securityItems
      .map(
        (item, index) => `
          <div class="accordion__item ${index === openIndex ? 'is-open' : ''}">
            <button class="accordion__button" type="button" data-accordion-index="${index}" aria-expanded="${index === openIndex}">
              <span class="accordion__title">${item.title}</span>
              <span class="accordion__icon">${index === openIndex ? '−' : '+'}</span>
            </button>
            <div class="accordion__body">
              <p>${item.body}</p>
            </div>
          </div>
        `
      )
      .join('');

    root.querySelectorAll('[data-accordion-index]').forEach((button) => {
      button.addEventListener('click', () => {
        const index = Number(button.dataset.accordionIndex);
        openIndex = openIndex === index ? -1 : index;
        draw();
      });
    });
  };

  draw();
}

renderFeaturePanels();
renderTestimonials();
renderAccordion();
