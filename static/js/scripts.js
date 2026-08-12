const content_dir = 'contents/';
const config_file = 'config.yml';
const section_names = ['home', 'awards', 'skills', 'experience', 'publications', 'interests'];

function wrapHeadingBlocks(container) {
    const children = Array.from(container.childNodes);
    const fragment = document.createDocumentFragment();
    let card = null;

    children.forEach((node) => {
        const isTitle = node.nodeType === 1 && /^H3$/i.test(node.tagName);
        if (isTitle) {
            card = document.createElement('article');
            card.className = 'article-card';
            fragment.appendChild(card);
        }
        if (card) {
            card.appendChild(node);
        } else {
            fragment.appendChild(node);
        }
    });

    container.innerHTML = '';
    container.appendChild(fragment);
}

function enhanceMarkdown(name) {
    const container = document.getElementById(name + '-md');
    if (!container) return;

    container.querySelectorAll('table').forEach((table) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'table-wrap';
        table.parentNode.insertBefore(wrapper, table);
        wrapper.appendChild(table);
    });

    if (['experience', 'publications'].includes(name)) {
        wrapHeadingBlocks(container);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    const mainNav = document.body.querySelector('#mainNav');
    if (mainNav && window.bootstrap) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#mainNav',
            offset: 96,
        });
    }

    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = Array.from(document.querySelectorAll('#navbarResponsive .nav-link'));
    responsiveNavItems.forEach((responsiveNavItem) => {
        responsiveNavItem.addEventListener('click', () => {
            if (navbarToggler && window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });

    fetch(content_dir + config_file)
        .then(response => response.text())
        .then(text => {
            const yml = jsyaml.load(text);
            Object.keys(yml).forEach(key => {
                const target = document.getElementById(key);
                if (target) target.innerHTML = yml[key];
            });
        })
        .catch(error => console.log(error));

    marked.use({ mangle: false, headerIds: false });
    section_names.forEach((name) => {
        fetch(content_dir + name + '.md')
            .then(response => response.text())
            .then(markdown => {
                const target = document.getElementById(name + '-md');
                if (!target) return;
                const htmlFirstSections = ['home', 'skills', 'interests'];
                target.innerHTML = htmlFirstSections.includes(name) ? markdown : marked.parse(markdown);
                enhanceMarkdown(name);
            })
            .then(() => {
                if (window.MathJax) MathJax.typeset();
            })
            .catch(error => console.log(error));
    });
});
