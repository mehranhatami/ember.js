import { get } from "ember-metal/property_get";
import { set } from "ember-metal/property_set";
import run from "ember-metal/run_loop";
import EnumerableUtils from "ember-metal/enumerable_utils";
import jQuery from "ember-views/system/jquery";
import { View } from "ember-views/views/view";
import ContainerView from "ember-views/views/container_view";

var indexOf = EnumerableUtils.indexOf;

// .......................................................
// removeChild()
//

var parentView, child;
QUnit.module("View#removeChild", {
  setup: function() {
    parentView = ContainerView.create({ childViews: [View] });
    child = get(parentView, 'childViews').objectAt(0);
  },
  teardown: function() {
    run(function() {
      parentView.destroy();
      child.destroy();
    });
  }
});

test("returns receiver", function() {
  equal(parentView.removeChild(child), parentView, 'receiver');
});

test("removes child from parent.childViews array", function() {
  ok(indexOf(get(parentView, 'childViews'), child)>=0, 'precond - has child in childViews array before remove');
  parentView.removeChild(child);
  ok(indexOf(get(parentView, 'childViews'), child)<0, 'removed child');
});

test("sets parentView property to null", function() {
  ok(get(child, 'parentView'), 'precond - has parentView');
  parentView.removeChild(child);
  ok(!get(child, 'parentView'), 'parentView is now null');
});

// .......................................................
// removeAllChildren()
//
var view, childViews;
QUnit.module("View#removeAllChildren", {
  setup: function() {
    view = ContainerView.create({
      childViews: [View, View, View]
    });
    childViews = view.get('childViews');
  },
  teardown: function() {
    run(function() {
      childViews.forEach(function(v) { v.destroy(); });
      view.destroy();
    });
  }
});

test("removes all child views", function() {
  equal(get(view, 'childViews.length'), 3, 'precond - has child views');

  view.removeAllChildren();
  equal(get(view, 'childViews.length'), 0, 'removed all children');
});

test("returns receiver", function() {
  equal(view.removeAllChildren(), view, 'receiver');
});

// .......................................................
// removeFromParent()
//
QUnit.module("View#removeFromParent", {
  teardown: function() {
    run(function() {
      if (parentView) { parentView.destroy(); }
      if (child) { child.destroy(); }
      if (view) { view.destroy(); }
    });
  }
});

test("removes view from parent view", function() {
  parentView = ContainerView.create({ childViews: [View] });
  child = get(parentView, 'childViews').objectAt(0);
  ok(get(child, 'parentView'), 'precond - has parentView');

  run(function() {
    parentView.createElement();
  });

  ok(parentView.$('div').length, "precond - has a child DOM element");

  run(function() {
    child.removeFromParent();
  });

  ok(!get(child, 'parentView'), 'no longer has parentView');
  ok(indexOf(get(parentView, 'childViews'), child)<0, 'no longer in parent childViews');
  equal(parentView.$('div').length, 0, "removes DOM element from parent");
});

test("returns receiver", function() {
  parentView = ContainerView.create({ childViews: [View] });
  child = get(parentView, 'childViews').objectAt(0);
  var removed = run(function() {
    return child.removeFromParent();
  });

  equal(removed, child, 'receiver');
});

test("does nothing if not in parentView", function() {
  var callCount = 0;
  child = View.create();

  // monkey patch for testing...
  ok(!get(child, 'parentView'), 'precond - has no parent');

  child.removeFromParent();

  run(function() {
    child.destroy();
  });
});


test("the DOM element is gone after doing append and remove in two separate runloops", function() {
  view = View.create();
  run(function() {
    view.append();
  });
  run(function() {
    view.remove();
  });

  var viewElem = jQuery('#'+get(view, 'elementId'));
  ok(viewElem.length === 0, "view's element doesn't exist in DOM");
});

test("the DOM element is gone after doing append and remove in a single runloop", function() {
  view = View.create();
  run(function() {
    view.append();
    view.remove();
  });

  var viewElem = jQuery('#'+get(view, 'elementId'));
  ok(viewElem.length === 0, "view's element doesn't exist in DOM");
});

