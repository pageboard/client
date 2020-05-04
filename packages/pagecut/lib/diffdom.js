'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function objToNode(objNode, insideSvg, options) {
    var node;
    if (objNode.nodeName === '#text') {
        node = options.document.createTextNode(objNode.data);

    } else if (objNode.nodeName === '#comment') {
        node = options.document.createComment(objNode.data);
    } else {
        if (objNode.nodeName === 'svg' || insideSvg) {
            node = options.document.createElementNS('http://www.w3.org/2000/svg', objNode.nodeName);
            insideSvg = true;
        } else {
            node = options.document.createElement(objNode.nodeName);
        }
        if (objNode.attributes) {
            Object.entries(objNode.attributes).forEach(function (ref) {
                var key = ref[0];
                var value = ref[1];

                return node.setAttribute(key, value);
            });
        }
        if (objNode.childNodes) {
            objNode.childNodes.forEach(function (childNode) { return node.appendChild(objToNode(childNode, insideSvg, options)); });
        }
        if (options.valueDiffing) {
            if (objNode.value) {
                node.value = objNode.value;
            }
            if (objNode.checked) {
                node.checked = objNode.checked;
            }
            if (objNode.selected) {
                node.selected = objNode.selected;
            }
        }
    }
    return node
}

// ===== Apply a diff =====

function getFromRoute(node, route) {
    route = route.slice();
    while (route.length > 0) {
        if (!node.childNodes) {
            return false
        }
        var c = route.splice(0, 1)[0];
        node = node.childNodes[c];
    }
    return node
}

function applyDiff(
        tree,
        diff,
        options // {preDiffApply, postDiffApply, textDiff, valueDiffing, _const}
    ) {
    var node = getFromRoute(tree, diff[options._const.route]);
    var newNode;
    var reference;
    var route;
    var nodeArray;
    var c;

    // pre-diff hook
    var info = {
        diff: diff,
        node: node
    };

    if (options.preDiffApply(info)) {
        return true
    }

    switch (diff[options._const.action]) {
        case options._const.addAttribute:
            if (!node || !node.setAttribute) {
                return false
            }
            node.setAttribute(diff[options._const.name], diff[options._const.value]);
            break
        case options._const.modifyAttribute:
            if (!node || !node.setAttribute) {
                return false
            }
            node.setAttribute(diff[options._const.name], diff[options._const.newValue]);
            if (node.nodeName === 'INPUT' && diff[options._const.name] === 'value') {
                node.value = diff[options._const.newValue];
            }
            break
        case options._const.removeAttribute:
            if (!node || !node.removeAttribute) {
                return false
            }
            node.removeAttribute(diff[options._const.name]);
            break
        case options._const.modifyTextElement:
            if (!node || node.nodeType !== 3) {
                return false
            }
            options.textDiff(node, node.data, diff[options._const.oldValue], diff[options._const.newValue]);
            break
        case options._const.modifyValue:
            if (!node || typeof node.value === 'undefined') {
                return false
            }
            node.value = diff[options._const.newValue];
            break
        case options._const.modifyComment:
            if (!node || typeof node.data === 'undefined') {
                return false
            }
            options.textDiff(node, node.data, diff[options._const.oldValue], diff[options._const.newValue]);
            break
        case options._const.modifyChecked:
            if (!node || typeof node.checked === 'undefined') {
                return false
            }
            node.checked = diff[options._const.newValue];
            break
        case options._const.modifySelected:
            if (!node || typeof node.selected === 'undefined') {
                return false
            }
            node.selected = diff[options._const.newValue];
            break
        case options._const.replaceElement:
            node.parentNode.replaceChild(
                objToNode(
                    diff[options._const.newValue],
                    node.namespaceURI === 'http://www.w3.org/2000/svg',
                    options
                ),
                node
            );
            break
        case options._const.relocateGroup:
            nodeArray = Array.apply(void 0, new Array(diff.groupLength)).map(function () { return node.removeChild(node.childNodes[diff[options._const.from]]); });
            nodeArray.forEach(function (childNode, index) {
                if (index === 0) {
                    reference = node.childNodes[diff[options._const.to]];
                }
                node.insertBefore(childNode, reference || null);
            });
            break
        case options._const.removeElement:
            node.parentNode.removeChild(node);
            break
        case options._const.addElement:
            route = diff[options._const.route].slice();
            c = route.splice(route.length - 1, 1)[0];
            node = getFromRoute(tree, route);
            node.insertBefore(
                objToNode(
                    diff[options._const.element],
                    node.namespaceURI === 'http://www.w3.org/2000/svg',
                    options
                ),
                node.childNodes[c] || null
            );
            break
        case options._const.removeTextElement:
            if (!node || node.nodeType !== 3) {
                return false
            }
            node.parentNode.removeChild(node);
            break
        case options._const.addTextElement:
            route = diff[options._const.route].slice();
            c = route.splice(route.length - 1, 1)[0];
            newNode = options.document.createTextNode(diff[options._const.value]);
            node = getFromRoute(tree, route);
            if (!node || !node.childNodes) {
                return false
            }
            node.insertBefore(newNode, node.childNodes[c] || null);
            break
        default:
            console.log('unknown action');
    }

    // if a new node was created, we might be interested in its
    // post diff hook
    info.newNode = newNode;
    options.postDiffApply(info);

    return true
}

function applyDOM(tree, diffs, options) {
    return diffs.every(function (diff) { return applyDiff(tree, diff, options); })
}

// ===== Undo a diff =====

function swap(obj, p1, p2) {
    var tmp = obj[p1];
    obj[p1] = obj[p2];
    obj[p2] = tmp;
}

function undoDiff(
    tree,
    diff,
    options // {preDiffApply, postDiffApply, textDiff, valueDiffing, _const}
) {

    switch (diff[options._const.action]) {
        case options._const.addAttribute:
            diff[options._const.action] = options._const.removeAttribute;
            applyDiff(tree, diff, options);
            break
        case options._const.modifyAttribute:
            swap(diff, options._const.oldValue, options._const.newValue);
            applyDiff(tree, diff, options);
            break
        case options._const.removeAttribute:
            diff[options._const.action] = options._const.addAttribute;
            applyDiff(tree, diff, options);
            break
        case options._const.modifyTextElement:
            swap(diff, options._const.oldValue, options._const.newValue);
            applyDiff(tree, diff, options);
            break
        case options._const.modifyValue:
            swap(diff, options._const.oldValue, options._const.newValue);
            applyDiff(tree, diff, options);
            break
        case options._const.modifyComment:
            swap(diff, options._const.oldValue, options._const.newValue);
            applyDiff(tree, diff, options);
            break
        case options._const.modifyChecked:
            swap(diff, options._const.oldValue, options._const.newValue);
            applyDiff(tree, diff, options);
            break
        case options._const.modifySelected:
            swap(diff, options._const.oldValue, options._const.newValue);
            applyDiff(tree, diff, options);
            break
        case options._const.replaceElement:
            swap(diff, options._const.oldValue, options._const.newValue);
            applyDiff(tree, diff, options);
            break
        case options._const.relocateGroup:
            swap(diff, options._const.from, options._const.to);
            applyDiff(tree, diff, options);
            break
        case options._const.removeElement:
            diff[options._const.action] = options._const.addElement;
            applyDiff(tree, diff, options);
            break
        case options._const.addElement:
            diff[options._const.action] = options._const.removeElement;
            applyDiff(tree, diff, options);
            break
        case options._const.removeTextElement:
            diff[options._const.action] = options._const.addTextElement;
            applyDiff(tree, diff, options);
            break
        case options._const.addTextElement:
            diff[options._const.action] = options._const.removeTextElement;
            applyDiff(tree, diff, options);
            break
        default:
            console.log('unknown action');
    }

}

function undoDOM(tree, diffs, options) {
    if (!diffs.length) {
        diffs = [diffs];
    }
    diffs = diffs.slice();
    diffs.reverse();
    diffs.forEach(function (diff) {
        undoDiff(tree, diff, options);
    });
}

var Diff = function Diff(options) {
    var this$1 = this;
    if ( options === void 0 ) options = {};

    Object.entries(options).forEach(function (ref) {
        var key = ref[0];
        var value = ref[1];

        return this$1[key] = value;
    });
};

Diff.prototype.toString = function toString () {
    return JSON.stringify(this)
};

Diff.prototype.setValue = function setValue (aKey, aValue) {
    this[aKey] = aValue;
    return this
};

function elementDescriptors(el) {
    var output = [];
    if (el.nodeName !== '#text' && el.nodeName !== '#comment') {
        output.push(el.nodeName);
        if (el.attributes) {
            if (el.attributes['class']) {
                output.push(((el.nodeName) + "." + (el.attributes['class'].replace(/ /g, '.'))));
            }
            if (el.attributes.id) {
                output.push(((el.nodeName) + "#" + (el.attributes.id)));
            }
        }

    }
    return output
}

function findUniqueDescriptors(li) {
    var uniqueDescriptors = {};
    var duplicateDescriptors = {};

    li.forEach(function (node) {
        elementDescriptors(node).forEach(function (descriptor) {
            var inUnique = descriptor in uniqueDescriptors;
            var inDupes = descriptor in duplicateDescriptors;
            if (!inUnique && !inDupes) {
                uniqueDescriptors[descriptor] = true;
            } else if (inUnique) {
                delete uniqueDescriptors[descriptor];
                duplicateDescriptors[descriptor] = true;
            }
        });
    });

    return uniqueDescriptors
}

function uniqueInBoth(l1, l2) {
    var l1Unique = findUniqueDescriptors(l1);
    var l2Unique = findUniqueDescriptors(l2);
    var inBoth = {};

    Object.keys(l1Unique).forEach(function (key) {
        if (l2Unique[key]) {
            inBoth[key] = true;
        }
    });

    return inBoth
}

function removeDone(tree) {
    delete tree.outerDone;
    delete tree.innerDone;
    delete tree.valueDone;
    if (tree.childNodes) {
        return tree.childNodes.every(removeDone)
    } else {
        return true
    }
}

function isEqual(e1, e2) {
    if (!['nodeName', 'value', 'checked', 'selected', 'data'].every(function (element) {
            if (e1[element] !== e2[element]) {
                return false
            }
            return true
        })) {
        return false
    }

    if (Boolean(e1.attributes) !== Boolean(e2.attributes)) {
        return false
    }

    if (Boolean(e1.childNodes) !== Boolean(e2.childNodes)) {
        return false
    }
    if (e1.attributes) {
        var e1Attributes = Object.keys(e1.attributes);
        var e2Attributes = Object.keys(e2.attributes);

        if (e1Attributes.length !== e2Attributes.length) {
            return false
        }
        if (!e1Attributes.every(function (attribute) {
                if (e1.attributes[attribute] !== e2.attributes[attribute]) {
                    return false
                }
                return true
            })) {
            return false
        }
    }
    if (e1.childNodes) {
        if (e1.childNodes.length !== e2.childNodes.length) {
            return false
        }
        if (!e1.childNodes.every(function (childNode, index) { return isEqual(childNode, e2.childNodes[index]); })) {

            return false
        }

    }

    return true
}


function roughlyEqual(e1, e2, uniqueDescriptors, sameSiblings, preventRecursion) {

    if (!e1 || !e2) {
        return false
    }

    if (e1.nodeName !== e2.nodeName) {
        return false
    }

    if (e1.nodeName === '#text') {
        // Note that we initially don't care what the text content of a node is,
        // the mere fact that it's the same tag and "has text" means it's roughly
        // equal, and then we can find out the true text difference later.
        return preventRecursion ? true : e1.data === e2.data
    }


    if (e1.nodeName in uniqueDescriptors) {
        return true
    }

    if (e1.attributes && e2.attributes) {

        if (e1.attributes.id) {
            if (e1.attributes.id !== e2.attributes.id) {
                return false
            } else {
                var idDescriptor = (e1.nodeName) + "#" + (e1.attributes.id);
                if (idDescriptor in uniqueDescriptors) {
                    return true
                }
            }
        }
        if (e1.attributes['class'] && e1.attributes['class'] === e2.attributes['class']) {
            var classDescriptor = (e1.nodeName) + "." + (e1.attributes['class'].replace(/ /g, '.'));
            if (classDescriptor in uniqueDescriptors) {
                return true
            }
        }
    }

    if (sameSiblings) {
        return true
    }

    var nodeList1 = e1.childNodes ? e1.childNodes.slice().reverse() : [];
    var nodeList2 = e2.childNodes ? e2.childNodes.slice().reverse() : [];

    if (nodeList1.length !== nodeList2.length) {
        return false
    }

    if (preventRecursion) {
        return nodeList1.every(function (element, index) { return element.nodeName === nodeList2[index].nodeName; })
    } else {
        // note: we only allow one level of recursion at any depth. If 'preventRecursion'
        // was not set, we must explicitly force it to true for child iterations.
        var childUniqueDescriptors = uniqueInBoth(nodeList1, nodeList2);
        return nodeList1.every(function (element, index) { return roughlyEqual(element, nodeList2[index], childUniqueDescriptors, true, true); })
    }
}


function cloneObj(obj) { //  TODO: Do we really need to clone here? Is it not enough to just return the original object?
    return JSON.parse(JSON.stringify(obj))
}
/**
 * based on https://en.wikibooks.org/wiki/Algorithm_implementation/Strings/Longest_common_substring#JavaScript
 */
function findCommonSubsets(c1, c2, marked1, marked2) {
    var lcsSize = 0;
    var index = [];
    var c1Length = c1.length;
    var c2Length = c2.length;

    var // set up the matching table
        matches = Array.apply(void 0, new Array(c1Length + 1)).map(function () { return []; });

    var uniqueDescriptors = uniqueInBoth(c1, c2);

    var // If all of the elements are the same tag, id and class, then we can
        // consider them roughly the same even if they have a different number of
        // children. This will reduce removing and re-adding similar elements.
        subsetsSame = c1Length === c2Length;

    if (subsetsSame) {

        c1.some(function (element, i) {
            var c1Desc = elementDescriptors(element);
            var c2Desc = elementDescriptors(c2[i]);
            if (c1Desc.length !== c2Desc.length) {
                subsetsSame = false;
                return true
            }
            c1Desc.some(function (description, i) {
                if (description !== c2Desc[i]) {
                    subsetsSame = false;
                    return true
                }
            });
            if (!subsetsSame) {
                return true
            }
        });
    }

    // fill the matches with distance values
    for (var c1Index = 0; c1Index < c1Length; c1Index++) {
        var c1Element = c1[c1Index];
        for (var c2Index = 0; c2Index < c2Length; c2Index++) {
            var c2Element = c2[c2Index];
            if (!marked1[c1Index] && !marked2[c2Index] && roughlyEqual(c1Element, c2Element, uniqueDescriptors, subsetsSame)) {
                matches[c1Index + 1][c2Index + 1] = (matches[c1Index][c2Index] ? matches[c1Index][c2Index] + 1 : 1);
                if (matches[c1Index + 1][c2Index + 1] >= lcsSize) {
                    lcsSize = matches[c1Index + 1][c2Index + 1];
                    index = [c1Index + 1, c2Index + 1];
                }
            } else {
                matches[c1Index + 1][c2Index + 1] = 0;
            }
        }
    }

    if (lcsSize === 0) {
        return false
    }

    return {
        oldValue: index[0] - lcsSize,
        newValue: index[1] - lcsSize,
        length: lcsSize
    }
}

/**
 * This should really be a predefined function in Array...
 */
function makeArray(n, v) {
    return Array.apply(void 0, new Array(n)).map(function () { return v; })
}

/**
 * Generate arrays that indicate which node belongs to which subset,
 * or whether it's actually an orphan node, existing in only one
 * of the two trees, rather than somewhere in both.
 *
 * So if t1 = <img><canvas><br>, t2 = <canvas><br><img>.
 * The longest subset is "<canvas><br>" (length 2), so it will group 0.
 * The second longest is "<img>" (length 1), so it will be group 1.
 * gaps1 will therefore be [1,0,0] and gaps2 [0,0,1].
 *
 * If an element is not part of any group, it will stay being 'true', which
 * is the initial value. For example:
 * t1 = <img><p></p><br><canvas>, t2 = <b></b><br><canvas><img>
 *
 * The "<p></p>" and "<b></b>" do only show up in one of the two and will
 * therefore be marked by "true". The remaining parts are parts of the
 * groups 0 and 1:
 * gaps1 = [1, true, 0, 0], gaps2 = [true, 0, 0, 1]
 *
 */
function getGapInformation(t1, t2, stable) {
    var gaps1 = t1.childNodes ? makeArray(t1.childNodes.length, true) : [];
    var gaps2 = t2.childNodes ? makeArray(t2.childNodes.length, true) : [];
    var group = 0;

    // give elements from the same subset the same group number
    stable.forEach(function (subset) {
        var endOld = subset.oldValue + subset.length;
        var endNew = subset.newValue + subset.length;

        for (var j = subset.oldValue; j < endOld; j += 1) {
            gaps1[j] = group;
        }
        for (var j$1 = subset.newValue; j$1 < endNew; j$1 += 1) {
            gaps2[j$1] = group;
        }
        group += 1;
    });

    return {
        gaps1: gaps1,
        gaps2: gaps2
    }
}

/**
 * Find all matching subsets, based on immediate child differences only.
 */
function markSubTrees(oldTree, newTree) {
    // note: the child lists are views, and so update as we update old/newTree
    var oldChildren = oldTree.childNodes ? oldTree.childNodes : [];

    var newChildren = newTree.childNodes ? newTree.childNodes : [];
    var marked1 = makeArray(oldChildren.length, false);
    var marked2 = makeArray(newChildren.length, false);
    var subsets = [];
    var subset = true;

    var returnIndex = function() {
        return arguments[1]
    };

    var markBoth = function (i) {
        marked1[subset.oldValue + i] = true;
        marked2[subset.newValue + i] = true;
    };

    while (subset) {
        subset = findCommonSubsets(oldChildren, newChildren, marked1, marked2);
        if (subset) {
            subsets.push(subset);
            var subsetArray = Array.apply(void 0, new Array(subset.length)).map(returnIndex);
            subsetArray.forEach(function (item) { return markBoth(item); });
        }
    }

    oldTree.subsets = subsets;
    oldTree.subsetsAge = 100;
    return subsets
}

var DiffTracker = function DiffTracker() {
    this.list = [];
};

DiffTracker.prototype.add = function add (diffs) {
        var ref;

    (ref = this.list).push.apply(ref, diffs);
};
DiffTracker.prototype.forEach = function forEach (fn) {
    this.list.forEach(function (li) { return fn(li); });
};

// ===== Apply a virtual diff =====

function getFromVirtualRoute(tree, route) {
    var node = tree;
    var parentNode;
    var nodeIndex;

    route = route.slice();
    while (route.length > 0) {
        if (!node.childNodes) {
            return false
        }
        nodeIndex = route.splice(0, 1)[0];
        parentNode = node;
        node = node.childNodes[nodeIndex];
    }
    return {
        node: node,
        parentNode: parentNode,
        nodeIndex: nodeIndex
    }
}

function applyVirtualDiff(
        tree,
        diff,
        options // {preVirtualDiffApply, postVirtualDiffApply, _const}
    ) {
    var routeInfo = getFromVirtualRoute(tree, diff[options._const.route]);
    var node = routeInfo.node;
    var parentNode = routeInfo.parentNode;
    var nodeIndex = routeInfo.nodeIndex;
    var newSubsets = [];

    // pre-diff hook
    var info = {
        diff: diff,
        node: node
    };

    if (options.preVirtualDiffApply(info)) {
        return true
    }

    var newNode;
    var nodeArray;
    var route;
    var c;
    switch (diff[options._const.action]) {
        case options._const.addAttribute:
            if (!node.attributes) {
                node.attributes = {};
            }

            node.attributes[diff[options._const.name]] = diff[options._const.value];

            if (diff[options._const.name] === 'checked') {
                node.checked = true;
            } else if (diff[options._const.name] === 'selected') {
                node.selected = true;
            } else if (node.nodeName === 'INPUT' && diff[options._const.name] === 'value') {
                node.value = diff[options._const.value];
            }

            break
        case options._const.modifyAttribute:
            node.attributes[diff[options._const.name]] = diff[options._const.newValue];
            break
        case options._const.removeAttribute:

            delete node.attributes[diff[options._const.name]];

            if (Object.keys(node.attributes).length === 0) {
                delete node.attributes;
            }

            if (diff[options._const.name] === 'checked') {
                node.checked = false;
            } else if (diff[options._const.name] === 'selected') {
                delete node.selected;
            } else if (node.nodeName === 'INPUT' && diff[options._const.name] === 'value') {
                delete node.value;
            }

            break
        case options._const.modifyTextElement:
            node.data = diff[options._const.newValue];
            break
        case options._const.modifyValue:
            node.value = diff[options._const.newValue];
            break
        case options._const.modifyComment:
            node.data = diff[options._const.newValue];
            break
        case options._const.modifyChecked:
            node.checked = diff[options._const.newValue];
            break
        case options._const.modifySelected:
            node.selected = diff[options._const.newValue];
            break
        case options._const.replaceElement:
            newNode = cloneObj(diff[options._const.newValue]);
            newNode.outerDone = true;
            newNode.innerDone = true;
            newNode.valueDone = true;
            parentNode.childNodes[nodeIndex] = newNode;
            break
        case options._const.relocateGroup:
            nodeArray = node.childNodes.splice(diff[options._const.from], diff.groupLength).reverse();
            nodeArray.forEach(function (movedNode) { return node.childNodes.splice(diff[options._const.to], 0, movedNode); });
            if (node.subsets) {
                node.subsets.forEach(function (map) {
                    if (diff[options._const.from] < diff[options._const.to] && map.oldValue <= diff[options._const.to] && map.oldValue > diff[options._const.from]) {
                        map.oldValue -= diff.groupLength;
                        var splitLength = map.oldValue + map.length - diff[options._const.to];
                        if (splitLength > 0) {
                            // new insertion splits map.
                            newSubsets.push({
                                oldValue: diff[options._const.to] + diff.groupLength,
                                newValue: map.newValue + map.length - splitLength,
                                length: splitLength
                            });
                            map.length -= splitLength;
                        }
                    } else if (diff[options._const.from] > diff[options._const.to] && map.oldValue > diff[options._const.to] && map.oldValue < diff[options._const.from]) {
                        map.oldValue += diff.groupLength;
                        var splitLength$1 = map.oldValue + map.length - diff[options._const.to];
                        if (splitLength$1 > 0) {
                            // new insertion splits map.
                            newSubsets.push({
                                oldValue: diff[options._const.to] + diff.groupLength,
                                newValue: map.newValue + map.length - splitLength$1,
                                length: splitLength$1
                            });
                            map.length -= splitLength$1;
                        }
                    } else if (map.oldValue === diff[options._const.from]) {
                        map.oldValue = diff[options._const.to];
                    }
                });
            }

            break
        case options._const.removeElement:
            parentNode.childNodes.splice(nodeIndex, 1);
            if (parentNode.subsets) {
                parentNode.subsets.forEach(function (map) {
                    if (map.oldValue > nodeIndex) {
                        map.oldValue -= 1;
                    } else if (map.oldValue === nodeIndex) {
                        map.delete = true;
                    } else if (map.oldValue < nodeIndex && (map.oldValue + map.length) > nodeIndex) {
                        if (map.oldValue + map.length - 1 === nodeIndex) {
                            map.length--;
                        } else {
                            newSubsets.push({
                                newValue: map.newValue + nodeIndex - map.oldValue,
                                oldValue: nodeIndex,
                                length: map.length - nodeIndex + map.oldValue - 1
                            });
                            map.length = nodeIndex - map.oldValue;
                        }
                    }
                });
            }
            node = parentNode;
            break
        case options._const.addElement:
            route = diff[options._const.route].slice();
            c = route.splice(route.length - 1, 1)[0];
            node = getFromVirtualRoute(tree, route).node;
            newNode = cloneObj(diff[options._const.element]);
            newNode.outerDone = true;
            newNode.innerDone = true;
            newNode.valueDone = true;

            if (!node.childNodes) {
                node.childNodes = [];
            }

            if (c >= node.childNodes.length) {
                node.childNodes.push(newNode);
            } else {
                node.childNodes.splice(c, 0, newNode);
            }
            if (node.subsets) {
                node.subsets.forEach(function (map) {
                    if (map.oldValue >= c) {
                        map.oldValue += 1;
                    } else if (map.oldValue < c && (map.oldValue + map.length) > c) {
                        var splitLength = map.oldValue + map.length - c;
                        newSubsets.push({
                            newValue: map.newValue + map.length - splitLength,
                            oldValue: c + 1,
                            length: splitLength
                        });
                        map.length -= splitLength;
                    }
                });
            }
            break
        case options._const.removeTextElement:
            parentNode.childNodes.splice(nodeIndex, 1);
            if (parentNode.nodeName === 'TEXTAREA') {
                delete parentNode.value;
            }
            if (parentNode.subsets) {
                parentNode.subsets.forEach(function (map) {
                    if (map.oldValue > nodeIndex) {
                        map.oldValue -= 1;
                    } else if (map.oldValue === nodeIndex) {
                        map.delete = true;
                    } else if (map.oldValue < nodeIndex && (map.oldValue + map.length) > nodeIndex) {
                        if (map.oldValue + map.length - 1 === nodeIndex) {
                            map.length--;
                        } else {
                            newSubsets.push({
                                newValue: map.newValue + nodeIndex - map.oldValue,
                                oldValue: nodeIndex,
                                length: map.length - nodeIndex + map.oldValue - 1
                            });
                            map.length = nodeIndex - map.oldValue;
                        }
                    }
                });
            }
            node = parentNode;
            break
        case options._const.addTextElement:
            route = diff[options._const.route].slice();
            c = route.splice(route.length - 1, 1)[0];
            newNode = {};
            newNode.nodeName = '#text';
            newNode.data = diff[options._const.value];
            node = getFromVirtualRoute(tree, route).node;
            if (!node.childNodes) {
                node.childNodes = [];
            }

            if (c >= node.childNodes.length) {
                node.childNodes.push(newNode);
            } else {
                node.childNodes.splice(c, 0, newNode);
            }
            if (node.nodeName === 'TEXTAREA') {
                node.value = diff[options._const.newValue];
            }
            if (node.subsets) {
                node.subsets.forEach(function (map) {
                    if (map.oldValue >= c) {
                        map.oldValue += 1;
                    }
                    if (map.oldValue < c && (map.oldValue + map.length) > c) {
                        var splitLength = map.oldValue + map.length - c;
                        newSubsets.push({
                            newValue: map.newValue + map.length - splitLength,
                            oldValue: c + 1,
                            length: splitLength
                        });
                        map.length -= splitLength;
                    }
                });
            }
            break
        default:
            console.log('unknown action');
    }

    if (node.subsets) {
        node.subsets = node.subsets.filter(function (map) { return !map.delete && map.oldValue !== map.newValue; });
        if (newSubsets.length) {
            node.subsets = node.subsets.concat(newSubsets);
        }
    }

    // capture newNode for the callback
    info.newNode = newNode;
    options.postVirtualDiffApply(info);

    return
}

function applyVirtual(tree, diffs, options) {
    diffs.forEach(function (diff) {
        applyVirtualDiff(tree, diff, options);
    });
    return true
}

function nodeToObj(aNode, options) {
    if ( options === void 0 ) options = {};

    var objNode = {};
    objNode.nodeName = aNode.nodeName;
    if (objNode.nodeName === '#text' || objNode.nodeName === '#comment') {
        objNode.data = aNode.data;
    } else {
        if (aNode.attributes && aNode.attributes.length > 0) {
            objNode.attributes = {};
            var nodeArray = Array.prototype.slice.call(aNode.attributes);
            nodeArray.forEach(function (attribute) { return objNode.attributes[attribute.name] = attribute.value; });
        }
        if (objNode.nodeName === 'TEXTAREA') {
            objNode.value = aNode.value;
        } else if (aNode.childNodes && aNode.childNodes.length > 0) {
            objNode.childNodes = [];
            var nodeArray$1 = Array.prototype.slice.call(aNode.childNodes);
            nodeArray$1.forEach(function (childNode) { return objNode.childNodes.push(nodeToObj(childNode, options)); });
        }
        if (options.valueDiffing) {
            if (aNode.checked !== undefined && aNode.type && ['radio', 'checkbox'].includes(aNode.type.toLowerCase())) {
                objNode.checked = aNode.checked;
            } else if (aNode.value !== undefined) {
                objNode.value = aNode.value;
            }
            if (aNode.selected !== undefined) {
                objNode.selected = aNode.selected;
            }
        }
    }
    return objNode
}

// from html-parse-stringify (MIT)

var tagRE = /<(?:"[^"]*"['"]*|'[^']*'['"]*|[^'">])+>/g;
// re-used obj for quick lookups of components
var empty = Object.create ? Object.create(null) : {};
var attrRE = /\s([^'"/\s><]+?)[\s/>]|([^\s=]+)=\s?(".*?"|'.*?')/g;


function unescape(string) {
    return string.replace(/&lt;/g, '<').replace(/&gt;/g, '>')
.replace(/&amp;/g, '&')
}

// create optimized lookup object for
// void elements as listed here:
// http://www.w3.org/html/wg/drafts/html/master/syntax.html#void-elements
var lookup = {
    area: true,
    base: true,
    br: true,
    col: true,
    embed: true,
    hr: true,
    img: true,
    input: true,
    keygen: true,
    link: true,
    menuItem: true,
    meta: true,
    param: true,
    source: true,
    track: true,
    wbr: true
};


function parseTag(tag) {
    var res = {
        nodeName: '',
        attributes: {}
    };

    var tagMatch = tag.match(/<\/?([^\s]+?)[/\s>]/);
    if (tagMatch) {
        res.nodeName = tagMatch[1].toUpperCase();
        if (lookup[tagMatch[1].toLowerCase()] || tag.charAt(tag.length - 2) === '/') { res.voidElement = true; }

    }

    var reg = new RegExp(attrRE);
    var result = null;
    var done = false;
    while (!done) {
        result = reg.exec(tag);

        if (result === null) {
            done = true;
        } else if (result[0].trim()) {
            if (result[1]) {
                var attr = result[1].trim();
                var arr = [attr, ""];

                if (attr.indexOf("=") > -1) { arr = attr.split("="); }

                res.attributes[arr[0]] = arr[1];
                reg.lastIndex--;
            } else if (result[2]) { res.attributes[result[2]] = result[3].trim().substring(1, result[3].length - 1); }
        }
    }

    return res
}

function parse(
    html,
    options
) {
    if ( options === void 0 ) options = {components: empty};

    var result = [];
    var current;
    var level = -1;
    var arr = [];
    var byTag = {};
    var inComponent = false;

    html.replace(tagRE, function (tag, index) {
        if (inComponent) {
            if (tag !== (("</" + (current.nodeName) + ">"))) {
                return
            } else {
                inComponent = false;
            }
        }
        var isOpen = tag.charAt(1) !== '/';
        var start = index + tag.length;
        var nextChar = html.charAt(start);
        var parent;

        if (isOpen) {
            level++;

            current = parseTag(tag);
            if (current.type === 'tag' && options.components[current.nodeName]) {
                current.type = 'component';
                inComponent = true;
            }

            if (!current.voidElement && !inComponent && nextChar && nextChar !== '<') {
                if (!current.childNodes) {
                    current.childNodes = [];
                }
                current.childNodes.push({
                    nodeName: '#text',
                    data: unescape(html.slice(start, html.indexOf('<', start)))
                });
            }

            byTag[current.tagName] = current;

            // if we're at root, push new base node
            if (level === 0) {
                result.push(current);
            }

            parent = arr[level - 1];

            if (parent) {
                if (!parent.childNodes) {
                    parent.childNodes = [];
                }
                parent.childNodes.push(current);
            }

            arr[level] = current;
        }

        if (!isOpen || current.voidElement) {
            level--;
            if (!inComponent && nextChar !== '<' && nextChar) {
                // trailing text node
                // if we're at the root, push a base text node. otherwise add as
                // a child to the current node.
                parent = level === -1 ? result : arr[level].childNodes || [];

                // calculate correct end of the data slice in case there's
                // no tag after the text node.
                var end = html.indexOf('<', start);
                var data = unescape(html.slice(start, end === -1 ? undefined : end));
                parent.push({
                    nodeName: '#text',
                    data: data
                });
            }
        }
    });

    return result[0]
}

function cleanObj(obj) {
    delete obj.voidElement;
    if (obj.childNodes) {
        obj.childNodes.forEach(function (child) { return cleanObj(child); });
    }
    return obj
}

function stringToObj(string) {
    return cleanObj(parse(string))
}

// ===== Create a diff =====

var DiffFinder = function DiffFinder(t1Node, t2Node, options) {
    this.options = options;
    this.t1 = (t1Node instanceof HTMLElement) ? nodeToObj(t1Node, this.options) : (typeof t1Node === 'string') ? stringToObj(t1Node, this.options) : JSON.parse(JSON.stringify(t1Node));
    this.t2 = (t2Node instanceof HTMLElement) ? nodeToObj(t2Node, this.options) : (typeof t2Node === 'string') ? stringToObj(t2Node, this.options) : JSON.parse(JSON.stringify(t2Node));
    this.diffcount = 0;
    this.foundAll = false;
    if (this.debug) {
        this.t1Orig = nodeToObj(t1Node, this.options);
        this.t2Orig = nodeToObj(t2Node, this.options);
    }

    this.tracker = new DiffTracker();
};

DiffFinder.prototype.init = function init () {
    return this.findDiffs(this.t1, this.t2)
};

DiffFinder.prototype.findDiffs = function findDiffs (t1, t2) {
    var diffs;
    do {
        if (this.options.debug) {
            this.diffcount += 1;
            if (this.diffcount > this.options.diffcap) {
                window.diffError = [this.t1Orig, this.t2Orig];
                throw new Error(("surpassed diffcap:" + (JSON.stringify(this.t1Orig)) + " -> " + (JSON.stringify(this.t2Orig))))
            }
        }
        diffs = this.findNextDiff(t1, t2, []);

        if (diffs.length === 0) {
            // Last check if the elements really are the same now.
            // If not, remove all info about being done and start over.
            // Sometimes a node can be marked as done, but the creation of subsequent diffs means that it has to be changed again.
            if (!isEqual(t1, t2)) {
                if (this.foundAll) {
                    console.error('Could not find remaining diffs!');
                } else {
                    this.foundAll = true;
                    removeDone(t1);
                    diffs = this.findNextDiff(t1, t2, []);
                }
            }
        }
        if (diffs.length > 0) {
            this.foundAll = false;
            this.tracker.add(diffs);
            applyVirtual(t1, diffs, this.options);
        }
    } while (diffs.length > 0)

    return this.tracker.list
};

DiffFinder.prototype.findNextDiff = function findNextDiff (t1, t2, route) {
    var diffs;
    var fdiffs;

    if (this.options.maxDepth && route.length > this.options.maxDepth) {
        return []
    }
    // outer differences?
    if (!t1.outerDone) {
        diffs = this.findOuterDiff(t1, t2, route);
        if (this.options.filterOuterDiff) {
            fdiffs = this.options.filterOuterDiff(t1, t2, diffs);
            if (fdiffs) { diffs = fdiffs; }
        }
        if (diffs.length > 0) {
            t1.outerDone = true;
            return diffs
        } else {
            t1.outerDone = true;
        }
    }
    // inner differences?
    if (!t1.innerDone) {
        diffs = this.findInnerDiff(t1, t2, route);
        if (diffs.length > 0) {
            return diffs
        } else {
            t1.innerDone = true;
        }
    }

    if (this.options.valueDiffing && !t1.valueDone) {
        // value differences?
        diffs = this.findValueDiff(t1, t2, route);

        if (diffs.length > 0) {
            t1.valueDone = true;
            return diffs
        } else {
            t1.valueDone = true;
        }
    }

    // no differences
    return []
};

DiffFinder.prototype.findOuterDiff = function findOuterDiff (t1, t2, route) {
    var diffs = [];
    var attr;
    var attr1;
    var attr2;
    var attrLength;
    var pos;
    var i;
    if (t1.nodeName !== t2.nodeName) {
        if (!route.length) {
            throw new Error('Top level nodes have to be of the same kind.')
        }
        return [new Diff()
            .setValue(this.options._const.action, this.options._const.replaceElement)
            .setValue(this.options._const.oldValue, cloneObj(t1))
            .setValue(this.options._const.newValue, cloneObj(t2))
            .setValue(this.options._const.route, route)
        ]
    }
    if (route.length && this.options.maxNodeDiffCount < Math.abs((t1.childNodes || []).length - (t2.childNodes || []).length)) {
        return [new Diff()
            .setValue(this.options._const.action, this.options._const.replaceElement)
            .setValue(this.options._const.oldValue, cloneObj(t1))
            .setValue(this.options._const.newValue, cloneObj(t2))
            .setValue(this.options._const.route, route)
        ]
    }

    if (t1.data !== t2.data) {
        // Comment or text node.
        if (t1.nodeName === '#text') {
            return [new Diff()
                .setValue(this.options._const.action, this.options._const.modifyTextElement)
                .setValue(this.options._const.route, route)
                .setValue(this.options._const.oldValue, t1.data)
                .setValue(this.options._const.newValue, t2.data)
            ]
        } else {
            return [new Diff()
                .setValue(this.options._const.action, this.options._const.modifyComment)
                .setValue(this.options._const.route, route)
                .setValue(this.options._const.oldValue, t1.data)
                .setValue(this.options._const.newValue, t2.data)
            ]
        }

    }

    attr1 = t1.attributes ? Object.keys(t1.attributes).sort() : [];
    attr2 = t2.attributes ? Object.keys(t2.attributes).sort() : [];

    attrLength = attr1.length;
    for (i = 0; i < attrLength; i++) {
        attr = attr1[i];
        pos = attr2.indexOf(attr);
        if (pos === -1) {
            diffs.push(new Diff()
                .setValue(this.options._const.action, this.options._const.removeAttribute)
                .setValue(this.options._const.route, route)
                .setValue(this.options._const.name, attr)
                .setValue(this.options._const.value, t1.attributes[attr])
            );
        } else {
            attr2.splice(pos, 1);
            if (t1.attributes[attr] !== t2.attributes[attr]) {
                diffs.push(new Diff()
                    .setValue(this.options._const.action, this.options._const.modifyAttribute)
                    .setValue(this.options._const.route, route)
                    .setValue(this.options._const.name, attr)
                    .setValue(this.options._const.oldValue, t1.attributes[attr])
                    .setValue(this.options._const.newValue, t2.attributes[attr])
                );
            }
        }
    }

    attrLength = attr2.length;
    for (i = 0; i < attrLength; i++) {
        attr = attr2[i];
        diffs.push(new Diff()
            .setValue(this.options._const.action, this.options._const.addAttribute)
            .setValue(this.options._const.route, route)
            .setValue(this.options._const.name, attr)
            .setValue(this.options._const.value, t2.attributes[attr])
        );
    }

    return diffs
};

DiffFinder.prototype.findInnerDiff = function findInnerDiff (t1, t2, route) {
    var t1ChildNodes = t1.childNodes ? t1.childNodes.slice() : [];
    var t2ChildNodes = t2.childNodes ? t2.childNodes.slice() : [];
    var last = Math.max(t1ChildNodes.length, t2ChildNodes.length);
    var childNodesLengthDifference = Math.abs(t1ChildNodes.length - t2ChildNodes.length);
    var diffs = [];
    var index = 0;
    if (!this.options.maxChildCount || last < this.options.maxChildCount) {
        var subtrees = t1.subsets && t1.subsetsAge-- ? t1.subsets : (t1.childNodes && t2.childNodes) ? markSubTrees(t1, t2) : [];

        if (subtrees.length > 0) {
            /* One or more groups have been identified among the childnodes of t1
             * and t2.
             */
            diffs = this.attemptGroupRelocation(t1, t2, subtrees, route);
            if (diffs.length > 0) {
                return diffs
            }
        }
    }


    /* 0 or 1 groups of similar child nodes have been found
     * for t1 and t2. 1 If there is 1, it could be a sign that the
     * contents are the same. When the number of groups is below 2,
     * t1 and t2 are made to have the same length and each of the
     * pairs of child nodes are diffed.
     */

    for (var i = 0; i < last; i += 1) {
        var e1 = t1ChildNodes[i];
        var e2 = t2ChildNodes[i];

        if (childNodesLengthDifference) {
            /* t1 and t2 have different amounts of childNodes. Add
             * and remove as necessary to obtain the same length */
            if (e1 && !e2) {
                if (e1.nodeName === '#text') {
                    diffs.push(new Diff()
                        .setValue(this.options._const.action, this.options._const.removeTextElement)
                        .setValue(this.options._const.route, route.concat(index))
                        .setValue(this.options._const.value, e1.data)
                    );
                    index -= 1;
                } else {
                    diffs.push(new Diff()
                        .setValue(this.options._const.action, this.options._const.removeElement)
                        .setValue(this.options._const.route, route.concat(index))
                        .setValue(this.options._const.element, cloneObj(e1))
                    );
                    index -= 1;
                }

            } else if (e2 && !e1) {
                if (e2.nodeName === '#text') {
                    diffs.push(new Diff()
                        .setValue(this.options._const.action, this.options._const.addTextElement)
                        .setValue(this.options._const.route, route.concat(index))
                        .setValue(this.options._const.value, e2.data)
                    );
                } else {
                    diffs.push(new Diff()
                        .setValue(this.options._const.action, this.options._const.addElement)
                        .setValue(this.options._const.route, route.concat(index))
                        .setValue(this.options._const.element, cloneObj(e2))
                    );
                }
            }
        }
        /* We are now guaranteed that childNodes e1 and e2 exist,
         * and that they can be diffed.
         */
        /* Diffs in child nodes should not affect the parent node,
         * so we let these diffs be submitted together with other
         * diffs.
         */

        if (e1 && e2) {
            if (!this.options.maxChildCount || last < this.options.maxChildCount) {
                diffs = diffs.concat(this.findNextDiff(e1, e2, route.concat(index)));
            } else if (!isEqual(e1, e2)) {
                if (t1ChildNodes.length > t2ChildNodes.length) {
                    diffs = diffs.concat([
                        new Diff()
                            .setValue(this.options._const.action, this.options._const.removeElement)
                            .setValue(this.options._const.element, cloneObj(e1))
                            .setValue(this.options._const.route, route.concat(index))
                    ]);
                    t1ChildNodes.splice(i, 1);
                    index -= 1;
                    childNodesLengthDifference -= 1;
                } else if (t1ChildNodes.length < t2ChildNodes.length) {
                    diffs = diffs.concat([
                        new Diff()
                            .setValue(this.options._const.action, this.options._const.addElement)
                            .setValue(this.options._const.element, cloneObj(e2))
                            .setValue(this.options._const.route, route.concat(index))
                    ]);
                    t1ChildNodes.splice(i, 0, {});
                    childNodesLengthDifference -= 1;
                } else {
                    diffs = diffs.concat([
                        new Diff()
                            .setValue(this.options._const.action, this.options._const.replaceElement)
                            .setValue(this.options._const.oldValue, cloneObj(e1))
                            .setValue(this.options._const.newValue, cloneObj(e2))
                            .setValue(this.options._const.route, route.concat(index))
                    ]);
                }

            }

        }
        index += 1;

    }
    t1.innerDone = true;
    return diffs
};

DiffFinder.prototype.attemptGroupRelocation = function attemptGroupRelocation (t1, t2, subtrees, route) {
    /* Either t1.childNodes and t2.childNodes have the same length, or
     * there are at least two groups of similar elements can be found.
     * attempts are made at equalizing t1 with t2. First all initial
     * elements with no group affiliation (gaps=true) are removed (if
     * only in t1) or added (if only in t2). Then the creation of a group
     * relocation diff is attempted.
     */
    var gapInformation = getGapInformation(t1, t2, subtrees);
    var gaps1 = gapInformation.gaps1;
    var gaps2 = gapInformation.gaps2;
    var shortest = Math.min(gaps1.length, gaps2.length);
    var destinationDifferent;
    var toGroup;
    var group;
    var node;
    var similarNode;
    var testI;
    var diffs = [];


    for (var index2 = 0, index1 = 0; index2 < shortest; index1 += 1, index2 += 1) {
        if (gaps1[index2] === true) {
            node = t1.childNodes[index1];
            if (node.nodeName === '#text') {
                if (t2.childNodes[index2].nodeName === '#text' && node.data !== t2.childNodes[index2].data) {
                    testI = index1;
                    while (t1.childNodes.length > testI + 1 && t1.childNodes[testI + 1].nodeName === '#text') {
                        testI += 1;
                        if (t2.childNodes[index2].data === t1.childNodes[testI].data) {
                            similarNode = true;
                            break
                        }
                    }
                    if (!similarNode) {
                        diffs.push(new Diff()
                            .setValue(this.options._const.action, this.options._const.modifyTextElement)
                            .setValue(this.options._const.route, route.concat(index2))
                            .setValue(this.options._const.oldValue, node.data)
                            .setValue(this.options._const.newValue, t2.childNodes[index2].data)
                        );
                        return diffs
                    }
                }
                diffs.push(new Diff()
                    .setValue(this.options._const.action, this.options._const.removeTextElement)
                    .setValue(this.options._const.route, route.concat(index2))
                    .setValue(this.options._const.value, node.data)
                );
                gaps1.splice(index2, 1);
                shortest = Math.min(gaps1.length, gaps2.length);
                index2 -= 1;
            } else {
                diffs.push(new Diff()
                    .setValue(this.options._const.action, this.options._const.removeElement)
                    .setValue(this.options._const.route, route.concat(index2))
                    .setValue(this.options._const.element, cloneObj(node))
                );
                gaps1.splice(index2, 1);
                shortest = Math.min(gaps1.length, gaps2.length);
                index2 -= 1;
            }

        } else if (gaps2[index2] === true) {
            node = t2.childNodes[index2];
            if (node.nodeName === '#text') {
                diffs.push(new Diff()
                    .setValue(this.options._const.action, this.options._const.addTextElement)
                    .setValue(this.options._const.route, route.concat(index2))
                    .setValue(this.options._const.value, node.data)
                );
                gaps1.splice(index2, 0, true);
                shortest = Math.min(gaps1.length, gaps2.length);
                index1 -= 1;
            } else {
                diffs.push(new Diff()
                    .setValue(this.options._const.action, this.options._const.addElement)
                    .setValue(this.options._const.route, route.concat(index2))
                    .setValue(this.options._const.element, cloneObj(node))
                );
                gaps1.splice(index2, 0, true);
                shortest = Math.min(gaps1.length, gaps2.length);
                index1 -= 1;
            }

        } else if (gaps1[index2] !== gaps2[index2]) {
            if (diffs.length > 0) {
                return diffs
            }
            // group relocation
            group = subtrees[gaps1[index2]];
            toGroup = Math.min(group.newValue, (t1.childNodes.length - group.length));
            if (toGroup !== group.oldValue) {
                // Check whether destination nodes are different than originating ones.
                destinationDifferent = false;
                for (var j = 0; j < group.length; j += 1) {
                    if (!roughlyEqual(t1.childNodes[toGroup + j], t1.childNodes[group.oldValue + j], [], false, true)) {
                        destinationDifferent = true;
                    }
                }
                if (destinationDifferent) {
                    return [new Diff()
                        .setValue(this.options._const.action, this.options._const.relocateGroup)
                        .setValue('groupLength', group.length)
                        .setValue(this.options._const.from, group.oldValue)
                        .setValue(this.options._const.to, toGroup)
                        .setValue(this.options._const.route, route)
                    ]
                }
            }
        }
    }
    return diffs
};

DiffFinder.prototype.findValueDiff = function findValueDiff (t1, t2, route) {
    // Differences of value. Only useful if the value/selection/checked value
    // differs from what is represented in the DOM. For example in the case
    // of filled out forms, etc.
    var diffs = [];

    if (t1.selected !== t2.selected) {
        diffs.push(new Diff()
            .setValue(this.options._const.action, this.options._const.modifySelected)
            .setValue(this.options._const.oldValue, t1.selected)
            .setValue(this.options._const.newValue, t2.selected)
            .setValue(this.options._const.route, route)
        );
    }

    if ((t1.value || t2.value) && t1.value !== t2.value && t1.nodeName !== 'OPTION') {
        diffs.push(new Diff()
            .setValue(this.options._const.action, this.options._const.modifyValue)
            .setValue(this.options._const.oldValue, t1.value || "")
            .setValue(this.options._const.newValue, t2.value || "")
            .setValue(this.options._const.route, route)
        );
    }
    if (t1.checked !== t2.checked) {
        diffs.push(new Diff()
            .setValue(this.options._const.action, this.options._const.modifyChecked)
            .setValue(this.options._const.oldValue, t1.checked)
            .setValue(this.options._const.newValue, t2.checked)
            .setValue(this.options._const.route, route)
        );
    }

    return diffs
};

var DEFAULT_OPTIONS = {
    debug: false,
    diffcap: 10, // Limit for how many diffs are accepting when debugging. Inactive when debug is false.
    maxDepth: false, // False or a numeral. If set to a numeral, limits the level of depth that the the diff mechanism looks for differences. If false, goes through the entire tree.
    maxChildCount: 50, // False or a numeral. If set to a numeral, only does a simplified form of diffing of contents so that the number of diffs cannot be higher than the number of child nodes.
    valueDiffing: true, // Whether to take into consideration the values of forms that differ from auto assigned values (when a user fills out a form).
    // syntax: textDiff: function (node, currentValue, expectedValue, newValue)
    textDiff: function textDiff(node, currentValue, expectedValue, newValue) {
        node.data = newValue;
        return
    },
    // empty functions were benchmarked as running faster than both
    // `f && f()` and `if (f) { f(); }`
    preVirtualDiffApply: function preVirtualDiffApply() {},
    postVirtualDiffApply: function postVirtualDiffApply() {},
    preDiffApply: function preDiffApply() {},
    postDiffApply: function postDiffApply() {},
    filterOuterDiff: null,
    compress: false, // Whether to work with compressed diffs
    _const: false, // object with strings for every change types to be used in diffs.
    document: window && window.document ? window.document : false
};


var DiffDOM = function DiffDOM(options) {
    var this$1 = this;
    if ( options === void 0 ) options = {};


    this.options = options;
    // IE11 doesn't have Object.assign and buble doesn't translate object spreaders
    // by default, so this is the safest way of doing it currently.
    Object.entries(DEFAULT_OPTIONS).forEach(function (ref) {
        var key = ref[0];
        var value = ref[1];

        if (!Object.prototype.hasOwnProperty.call(this$1.options, key)) {
            this$1.options[key] = value;
        }
    });

    if (!this.options._const) {
        var varNames = ["addAttribute", "modifyAttribute", "removeAttribute",
            "modifyTextElement", "relocateGroup", "removeElement", "addElement",
            "removeTextElement", "addTextElement", "replaceElement", "modifyValue",
            "modifyChecked", "modifySelected", "modifyComment", "action", "route",
            "oldValue", "newValue", "element", "group", "from", "to", "name",
            "value", "data", "attributes", "nodeName", "childNodes", "checked",
            "selected"
        ];
        this.options._const = {};
        if (this.options.compress) {
            varNames.forEach(function (varName, index) { return this$1.options._const[varName] = index; });
        } else {
            varNames.forEach(function (varName) { return this$1.options._const[varName] = varName; });
        }
    }

    this.DiffFinder = DiffFinder;

};

DiffDOM.prototype.apply = function apply (tree, diffs) {
    return applyDOM(tree, diffs, this.options)
};

DiffDOM.prototype.undo = function undo (tree, diffs) {
    return undoDOM(tree, diffs, this.options)
};

DiffDOM.prototype.diff = function diff (t1Node, t2Node) {
    var finder = new this.DiffFinder(t1Node, t2Node, this.options);
    return finder.init()
};

/**
 * Use TraceLogger to figure out function calls inside
 * JS objects by wrapping an object with a TraceLogger
 * instance.
 *
 * Pretty-prints the call trace (using unicode box code)
 * when tracelogger.toString() is called.
 */

/**
 * Wrap an object by calling new TraceLogger(obj)
 *
 * If you're familiar with Python decorators, this
 * does roughly the same thing, adding pre/post
 * call hook logging calls so that you can see
 * what's going on.
 */
var TraceLogger = function TraceLogger(obj) {
    var this$1 = this;
    if ( obj === void 0 ) obj = {};

    this.pad = "│   ";
    this.padding = "";
    this.tick = 1;
    this.messages = [];
    var wrapkey = function (obj, key) {
        // trace this function
        var oldfn = obj[key];
        obj[key] = function () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            this$1.fin(key, Array.prototype.slice.call(args));
            var result = oldfn.apply(obj, args);
            this$1.fout(key, result);
            return result
        };
    };
    // can't use Object.keys for prototype walking
    for (var key in obj) {
        if (typeof obj[key] === "function") {
            wrapkey(obj, key);
        }
    }
    this.log("┌ TRACELOG START");
};
// called when entering a function
TraceLogger.prototype.fin = function fin (fn, args) {
    this.padding += this.pad;
    this.log(("├─> entering " + fn), args);
};
// called when exiting a function
TraceLogger.prototype.fout = function fout (fn, result) {
    this.log("│<──┘ generated return value", result);
    this.padding = this.padding.substring(0, this.padding.length - this.pad.length);
};
// log message formatting
TraceLogger.prototype.format = function format (s, tick) {
    var nf = function(t) {
        t = "" + t;
        while (t.length < 4) {
            t = "0" + t;
        }
        return t
    };
    return ((nf(tick)) + "> " + (this.padding) + s)
};
// log a trace message
TraceLogger.prototype.log = function log () {
    var s = Array.prototype.slice.call(arguments);
    var stringCollapse = function(v) {
        if (!v) {
            return "<falsey>"
        }
        if (typeof v === "string") {
            return v
        }
        if (v instanceof HTMLElement) {
            return v.outerHTML || "<empty>"
        }
        if (v instanceof Array) {
            return ("[" + (v.map(stringCollapse).join(",")) + "]")
        }
        return v.toString() || v.valueOf() || "<unknown>"
    };
    s = s.map(stringCollapse).join(", ");
    this.messages.push(this.format(s, this.tick++));
};
// turn the log into a structured string with
// unicode box codes to make it a sensible trace.
TraceLogger.prototype.toString = function toString () {
    var cap = "×   ";
    var terminator = "└───";
    while (terminator.length <= this.padding.length + this.pad.length) {
        terminator += cap;
    }
    var _ = this.padding;
    this.padding = "";
    terminator = this.format(terminator, this.tick);
    this.padding = _;
    return ((this.messages.join("\n")) + "\n" + terminator)
};

exports.DiffDOM = DiffDOM;
exports.TraceLogger = TraceLogger;
exports.nodeToObj = nodeToObj;
exports.stringToObj = stringToObj;
//# sourceMappingURL=index.js.map
