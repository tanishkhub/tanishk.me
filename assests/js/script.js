document.documentElement.classList.add('js');

const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.site-nav');
const loginDialog = document.querySelector('#editor-login');
const editorDialog = document.querySelector('#site-editor');
const loginForm = document.querySelector('#editor-login-form');
const editorForm = document.querySelector('#site-editor-form');
const editorFields = document.querySelector('#editor-fields');
const loginMessage = document.querySelector('#editor-login-message');
const saveMessage = document.querySelector('#editor-save-message');

const fieldGroups = {
  Profile: [
    ['profileRole', 'Role'],
    ['profileLocation', 'Location line'],
    ['heroTitleLead', 'Headline'],
    ['heroTitleEmphasis', 'Headline emphasis'],
    ['heroIntro', 'Introduction', 'textarea'],
    ['currentRole', 'Current role'],
    ['portraitImage', 'Portrait image path or HTTPS URL'],
    ['portraitUpload', 'Upload a new portrait (JPEG, PNG, WebP; max 3 MB)', 'file', 'image/jpeg,image/png,image/webp'],
    ['portraitAlt', 'Portrait description'],
    ['resumeUrl', 'Resume path or HTTPS URL'],
    ['resumeUpload', 'Upload a new resume (PDF; max 3 MB)', 'file', 'application/pdf'],
  ],
  Projects: [
    ['projectOneTitle', 'Project 1 title'],
    ['projectOneDescription', 'Project 1 description', 'textarea'],
    ['projectOneOutcome', 'Project 1 outcome'],
    ['projectOneStatus', 'Project 1 status'],
    ['projectOneImage', 'Project 1 image path or HTTPS URL'],
    ['projectOneImageAlt', 'Project 1 image description'],
    ['projectTwoTitle', 'Project 2 title'],
    ['projectTwoDescription', 'Project 2 description', 'textarea'],
    ['projectTwoOutcome', 'Project 2 outcome'],
    ['projectThreeTitle', 'Project 3 title'],
    ['projectThreeDescription', 'Project 3 description', 'textarea'],
  ],
  About: [
    ['aboutHeadingOne', 'Heading line 1'],
    ['aboutHeadingTwo', 'Heading line 2'],
    ['aboutHeadingEmphasis', 'Heading emphasis'],
    ['aboutLead', 'Lead paragraph', 'textarea'],
    ['aboutParagraphOne', 'Paragraph 1', 'textarea'],
    ['aboutParagraphTwo', 'Paragraph 2', 'textarea'],
    ['location', 'Based in'],
    ['education', 'Education'],
  ],
  Experience: [
    ['experienceOneDate', 'Entry 1 dates'],
    ['experienceOneRole', 'Entry 1 role'],
    ['experienceOneCompany', 'Entry 1 organization'],
    ['experienceTwoDate', 'Entry 2 dates'],
    ['experienceTwoRole', 'Entry 2 role'],
    ['experienceTwoCompany', 'Entry 2 organization'],
    ['experienceThreeDate', 'Entry 3 dates'],
    ['experienceThreeRole', 'Entry 3 role'],
    ['experienceThreeCompany', 'Entry 3 organization'],
    ['experienceFourDate', 'Entry 4 dates'],
    ['experienceFourRole', 'Entry 4 role'],
    ['experienceFourCompany', 'Entry 4 organization'],
  ],
  Contact: [
    ['contactHeadingOne', 'Heading line 1'],
    ['contactHeadingEmphasis', 'Heading emphasis'],
    ['contactDescription', 'Description', 'textarea'],
    ['contactEmail', 'Email address', 'email'],
    ['linkedinUrl', 'LinkedIn URL', 'url'],
    ['githubUrl', 'GitHub URL', 'url'],
  ],
};

let savedContent = {};
let draftContent = {};
const pendingUploads = new Map();
const uploadPreviewUrls = new Map();
const uploadTargets = {
  portraitUpload: { field: 'portraitImage', types: ['image/jpeg', 'image/png', 'image/webp'] },
  resumeUpload: { field: 'resumeUrl', types: ['application/pdf'] },
};

function clearUploadPreviews() {
  uploadPreviewUrls.forEach((url) => URL.revokeObjectURL(url));
  uploadPreviewUrls.clear();
}

function safeUrl(value) {
  try {
    const url = new URL(value, window.location.href);
    return url.protocol === 'https:' || url.origin === window.location.origin ? value : '#';
  } catch {
    return '#';
  }
}

function applyContent(content) {
  document.querySelectorAll('[data-site-field]').forEach((element) => {
    const key = element.dataset.siteField;
    if (typeof content[key] === 'string') element.textContent = content[key];
  });
  document.querySelectorAll('[data-site-href]').forEach((element) => {
    const key = element.dataset.siteHref;
    const value = content[key];
    if (typeof value !== 'string') return;
    element.href = uploadPreviewUrls.get(key) || (key === 'contactEmail' ? `mailto:${value}` : safeUrl(value));
  });
  document.querySelectorAll('[data-site-image]').forEach((element) => {
    const value = content[element.dataset.siteImage];
    if (typeof value === 'string') element.src = uploadPreviewUrls.get(element.dataset.siteImage) || safeUrl(value);
    const alt = content[element.dataset.siteAlt];
    if (typeof alt === 'string') element.alt = alt;
  });
}

function buildEditor(content) {
  editorFields.replaceChildren();
  Object.entries(fieldGroups).forEach(([groupName, fields]) => {
    const group = document.createElement('fieldset');
    const legend = document.createElement('legend');
    legend.textContent = groupName;
    group.append(legend);

    fields.forEach(([key, labelText, type = 'text', accept]) => {
      const label = document.createElement('label');
      const labelTextElement = document.createElement('span');
      labelTextElement.textContent = labelText;
      const input = type === 'textarea' ? document.createElement('textarea') : document.createElement('input');
      if (input instanceof HTMLInputElement) input.type = type;
      if (type === 'file') input.accept = accept;
      input.name = key;
      if (type !== 'file') input.value = content[key] || '';
      input.required = type === 'email' || type === 'url';
      input.dataset.editorField = key;
      if (type === 'file') {
        input.addEventListener('change', () => {
          const file = input.files?.[0];
          if (!file) return;
          const target = uploadTargets[key];
          if (!target.types.includes(file.type) || file.size > 3 * 1024 * 1024) {
            input.value = '';
            saveMessage.textContent = 'Choose a supported file no larger than 3 MB.';
            return;
          }
          pendingUploads.set(key, { field: target.field, file });
          const previousUrl = uploadPreviewUrls.get(target.field);
          if (previousUrl) URL.revokeObjectURL(previousUrl);
          uploadPreviewUrls.set(target.field, URL.createObjectURL(file));
          applyContent(draftContent);
          saveMessage.textContent = `${file.name} is ready. Publish changes to save it.`;
        });
      } else {
        input.addEventListener('input', () => {
          draftContent[key] = input.value;
          applyContent(draftContent);
        });
      }
      label.append(labelTextElement, input);
      group.append(label);
    });
    editorFields.append(group);
  });
}

function openEditor() {
  pendingUploads.clear();
  clearUploadPreviews();
  draftContent = { ...savedContent };
  buildEditor(draftContent);
  saveMessage.textContent = '';
  editorDialog.showModal();
}

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      if (typeof reader.result !== 'string') {
        reject(new Error('Could not read the selected file.'));
        return;
      }
      resolve(reader.result.split(',')[1]);
    });
    reader.addEventListener('error', () => reject(new Error('Could not read the selected file.')));
    reader.readAsDataURL(file);
  });
}

async function postEditorAction(payload) {
  let response;
  try {
    response = await fetch('/api/site', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error('Editor API unavailable. Run the site with Vercel dev and configure its environment variables.');
  }

  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error('Editor API unavailable. Run the site with Vercel dev and configure its environment variables.');
  }
  if (!response.ok) throw new Error(result.error || 'Editor request failed.');
  return result;
}

function showLogin() {
  loginMessage.textContent = '';
  loginForm.reset();
  loginDialog.showModal();
}

document.querySelectorAll('[data-close-dialog]').forEach((button) => {
  button.addEventListener('click', () => button.closest('dialog').close());
});

document.querySelectorAll('.editor-dialog').forEach((dialog) => {
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
});

const portrait = document.querySelector('[data-site-image="portraitImage"]');
let portraitClickCount = 0;
let portraitClickTimer;
function countPortraitClick() {
  portraitClickCount += 1;
  window.clearTimeout(portraitClickTimer);
  if (portraitClickCount === 7) {
    portraitClickCount = 0;
    showLogin();
  } else {
    portraitClickTimer = window.setTimeout(() => { portraitClickCount = 0; }, 2500);
  }
}
portrait?.addEventListener('click', countPortraitClick);
portrait?.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    countPortraitClick();
  }
});

loginForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const submitButton = loginForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  loginMessage.textContent = '';
  try {
    await postEditorAction({ action: 'login', password: new FormData(loginForm).get('password') });
    loginDialog.close();
    openEditor();
  } catch (error) {
    loginMessage.textContent = error.message;
  } finally {
    submitButton.disabled = false;
  }
});

editorForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const submitButton = editorForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  saveMessage.textContent = 'Publishing…';
  try {
    const uploads = await Promise.all(Array.from(pendingUploads.values(), async ({ field, file }) => {
      const contentBase64 = await readFileAsBase64(file);
      const upload = await postEditorAction({ action: 'upload', field, mimeType: file.type, contentBase64 });
      return { field, path: upload.path };
    }));
    uploads.forEach(({ field, path }) => {
      draftContent[field] = path;
      const previewUrl = uploadPreviewUrls.get(field);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      uploadPreviewUrls.delete(field);
      applyContent(draftContent);
    });
    pendingUploads.clear();
    saveMessage.textContent = 'Saving site details…';
    const result = await postEditorAction({ action: 'save', content: draftContent });
    savedContent = { ...result.content };
    draftContent = { ...savedContent };
    clearUploadPreviews();
    applyContent(savedContent);
    saveMessage.textContent = result.local
      ? 'Saved locally to content/site.json. It has not been published.'
      : 'Published. Changes will be live for everyone after deployment completes.';
  } catch (error) {
    saveMessage.textContent = error.message;
  } finally {
    submitButton.disabled = false;
  }
});

document.querySelector('#editor-logout')?.addEventListener('click', async () => {
  try {
    await postEditorAction({ action: 'logout' });
  } catch (error) {
    saveMessage.textContent = error.message;
  }
  editorDialog.close();
  applyContent(savedContent);
});

editorDialog?.addEventListener('close', () => {
  pendingUploads.clear();
  clearUploadPreviews();
  applyContent(savedContent);
});

try {
  const response = await fetch('./content/site.json', { cache: 'no-store' });
  if (!response.ok) throw new Error('Site content could not be loaded.');
  savedContent = await response.json();
  applyContent(savedContent);
} catch (error) {
  console.error(error);
}

function closeMenu() {
  menuButton?.setAttribute('aria-expanded', 'false');
  menuButton?.setAttribute('aria-label', 'Open navigation');
  navigation?.classList.remove('is-open');
}

menuButton?.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
  navigation?.classList.toggle('is-open', !isOpen);
});

navigation?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeMenu();
});

const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('[data-reveal]').forEach((element) => revealObserver.observe(element));
document.querySelector('#year').textContent = new Date().getFullYear();