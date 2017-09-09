/**
 * @author: laurent blanes <laurent.blanes@gmail.com>
 * @tutorial: https://hekigan.github.io/vue-directive-tooltip/
 */
import Tooltip from './tooltip.js';

const BASE_CLASS = 'vue-tooltip';

/**
 * usage:
 *
 * // basic usage:
 * <div v-tooltip="'my content'">
 * or
 * <div v-tooltip="{content: 'my content'}">
 *
 * // change position of tooltip
 * // options: bottom (default) | top | left | right
 * <div v-tooltip.top="{content: 'my content'}">
 *
 * // add custom class
 * <div v-tooltip="{class: 'custom-class', content: 'my content'}">
 *
 * // toggle visibility
 * <div v-tooltip="{visible: false, content: 'my content'}">
 */
export default {
    name: 'tooltip',
    config: {},
    install (Vue, installOptions) {
        Vue.directive('tooltip', {
            bind (el, binding, vnode) {
                if (installOptions) {
                    Tooltip.defaults(installOptions);
                }
            },
            inserted (el, binding, vnode, oldVnode) {
                if (installOptions) {
                    Tooltip.defaults(installOptions);
                }
                let options = filterBindings(binding);
                el.tooltip = new Tooltip(el, options);

                if (binding.modifiers.notrigger && binding.value.visible === true) {
                    el.tooltip.show();
                }

                if (binding.value.visible === false) {
                    el.tooltip.disabled = true;
                }
            },
            componentUpdated (el, binding, vnode, oldVnode) {
                update(el, binding);
            },
            unbind (el, binding, vnode, oldVnode) {
                el.tooltip.destroy();
            }
        });
    }
};

function filterBindings (binding) {
    const delay = isNaN(binding.value.delay) ? Tooltip._defaults.delay : binding.value.delay;

    return {
        class: getClass(binding),
        html: binding.value.html,
        placement: getPlacement(binding),
        title: getContent(binding),
        triggers: getTriggers(binding),
        offset: binding.value.offset || Tooltip._defaults.offset,
        delay
    };
}

/**
 * Get placement from modifiers
 * @param {*} binding
 */
function getPlacement ({modifiers}) {
    let placement = 'auto';

    // Placement
    if (modifiers.left) {
        placement = 'left';
    } else if (modifiers.right) {
        placement = 'right';
    } else if (modifiers.top) {
        placement = 'top';
    } else if (modifiers.bottom) {
        placement = 'bottom';
    } else if (Tooltip._defaults.placement) {
        placement = Tooltip._defaults.placement;
    }

    return placement;
}

/**
 * Get trigger value from modifiers
 * @param {*} binding
 * @return String
 */
function getTriggers ({modifiers}) {
    let trigger = [];
    if (modifiers.notrigger) {
        return trigger;
    } else if (modifiers.manual) {
        trigger.push('manual');
    } else {
        if (modifiers.click) {
            trigger.push('click');
        }

        if (modifiers.hover) {
            trigger.push('hover');
        }

        if (modifiers.focus) {
            trigger.push('focus');
        }

        if (trigger.length === 0) {
            trigger.push('hover', 'focus');
        }
    }

    return trigger;
}

/**
 * Check if the variable is an object
 * @param {*} value
 * @return Boolean
 */
function isObject (value) {
    return typeof value === 'object';
}

/**
 * Check if the variable is an html element
 * @param {*} value
 * @return Boolean
 */
function isElement (value) {
    return value instanceof window.Element;
}

/**
 * Get the css class
 * @param {*} binding
 * @return HTMLElement | String
 */
function getClass ({value}) {
    if (isObject(value) && typeof value.class === 'string') {
        return `${BASE_CLASS} ${value.class}`;
    } else if (Tooltip._defaults.class) {
        return `${BASE_CLASS} ${Tooltip._defaults.class}`;
    } else {
        return BASE_CLASS;
    }
}

/**
 * Get the content
 * @param {*} binding
 * @return HTMLElement | String
 */
function getContent ({value}) {
    if (isObject(value)) {
        if (value.content !== undefined) {
            return `${value.content}`;
        } else if (value.html && document.getElementById(value.html)) {
            return document.getElementById(value.html);
        } else if (isElement(value.html)) {
            return value.html;
        } else {
            return '';
        }
    } else {
        return `${value}`;
    }
}

/**
 * Action on element update
 * @param {*} el Vue element
 * @param {*} binding
 */
function update (el, binding) {
    if (typeof binding.value === 'string') {
        el.tooltip._content = binding.value;
    } else {
        if (binding.value.class && binding.value.class.trim() !== el.tooltip.options.class.replace(BASE_CLASS, '').trim()) {
            el.tooltip.class = `${BASE_CLASS} ${binding.value.class.trim()}`;
        }

        el.tooltip.content(getContent(binding));

        if (!binding.modifiers.notrigger && typeof binding.value.visible === 'boolean') {
            el.tooltip.disabled = !binding.value.visible;
            return;
        } else if (binding.modifiers.notrigger) {
            el.tooltip.disabled = false;
        }

        if (!el.tooltip.disabled && binding.value.visible === true) {
            el.tooltip.show();
        } else {
            el.tooltip.hide();
        }
    }
}