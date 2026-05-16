import { useState, useEffect } from "react";
import { ShoppingCart, Plus, X, Check, Trash2 } from "lucide-react";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";
import api from "../services/api";

const CATEGORIES = [
  "Produce",
  "Dairy",
  "Meat",
  "Grains",
  "Spices",
  "Beverages",
  "Other",
];

const UNITS = ["pcs", "kg", "g", "l", "ml", "cup", "tbsp", "tsp", "pack"];

const ShoppingList = () => {
  const [items, setItems] = useState([]);
  const [groupedItems, setGroupedItems] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShoppingList();
  }, []);

  const fetchShoppingList = async () => {
    try {
      const response = await api.get("/shopping-list?grouped=true");
      const grouped = response.data.data.items;

      const flatItems = [];

      grouped.forEach((group) => {
        group.items.forEach((item) => {
          flatItems.push({
            ...item,
            category: group.category,
          });
        });
      });

      setItems(flatItems);
      organizeByCategory(flatItems);
    } catch (error) {
      toast.error("Failed to load shopping list");
    } finally {
      setLoading(false);
    }
  };

  const organizeByCategory = (itemsList) => {
    const grouped = {};

    itemsList.forEach((item) => {
      const category = item.category || "Other";

      if (!grouped[category]) {
        grouped[category] = [];
      }

      grouped[category].push(item);
    });

    setGroupedItems(grouped);
  };

  const handleToggleChecked = async (id) => {
    try {
      await api.put(`/shopping-list/${id}/toggle`);

      const updatedItems = items.map((item) =>
        item.id === id ? { ...item, is_checked: !item.is_checked } : item,
      );

      setItems(updatedItems);
      organizeByCategory(updatedItems);
    } catch (error) {
      toast.error("Failed to update item");
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      await api.delete(`/shopping-list/${id}`);

      const updatedItems = items.filter((item) => item.id !== id);

      setItems(updatedItems);
      organizeByCategory(updatedItems);

      toast.success("Item removed");
    } catch (error) {
      toast.error("Failed to delete item");
    }
  };

  const handleClearChecked = async () => {
    if (!confirm("Remove all checked items?")) return;

    try {
      await api.delete("/shopping-list/clear/checked");

      const updatedItems = items.filter((item) => !item.is_checked);

      setItems(updatedItems);
      organizeByCategory(updatedItems);

      toast.success("Checked items cleared");
    } catch (error) {
      toast.error("Failed to clear items");
    }
  };

  const handleAddToPantry = async () => {
    const checkedCount = items.filter((item) => item.is_checked).length;

    if (checkedCount === 0) {
      toast.error("No items checked");
      return;
    }

    if (!confirm(`Add ${checkedCount} checked items to pantry?`)) return;

    try {
      await api.post("/shopping-list/add-to-pantry");

      const updatedItems = items.filter((item) => !item.is_checked);

      setItems(updatedItems);
      organizeByCategory(updatedItems);

      toast.success("Items added to pantry");
    } catch (error) {
      toast.error("Failed to add items to pantry");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="flex items-center justify-center h-96">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  const checkedCount = items.filter((item) => item.is_checked).length;

  const totalCount = items.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Shopping List</h1>

          <p className="text-gray-600 mt-1">
            {totalCount > 0
              ? `${checkedCount} of ${totalCount} items checked`
              : "Your shopping list is empty"}
          </p>
        </div>

        {totalCount > 0 && (
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Item
            </button>

            {checkedCount > 0 && (
              <>
                <button
                  onClick={handleAddToPantry}
                  className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Pantry ({checkedCount})
                </button>

                <button
                  onClick={handleClearChecked}
                  className="flex items-center gap-2 border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2.5 rounded-lg font-medium transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                  Clear Checked
                </button>
              </>
            )}
          </div>
        )}

        {totalCount > 0 ? (
          <div className="space-y-6">
            {Object.entries(groupedItems).map(([category, categoryItems]) => (
              <div
                key={category}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                  <h2 className="font-semibold text-gray-900">{category}</h2>
                </div>

                <div className="divide-y divide-gray-100">
                  {categoryItems.map((item) => (
                    <ShoppingListItem
                      key={item.id}
                      item={item}
                      onToggle={handleToggleChecked}
                      onDelete={handleDeleteItem}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />

            <p className="text-gray-500 mb-4">Your shopping list is empty</p>

            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add First Item
            </button>
          </div>
        )}
      </div>

      {showAddModal && (
        <AddItemModal
          onClose={() => setShowAddModal(false)}
          onSuccess={fetchShoppingList}
        />
      )}
    </div>
  );
};

const ShoppingListItem = ({ item, onToggle, onDelete }) => {
  return (
    <div className="flex items-center justify-between px-6 py-4">
      <button
        type="button"
        onClick={() => onToggle(item.id)}
        className="flex items-start gap-3 text-left flex-1"
      >
        <span
          className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors ${
            item.is_checked
              ? "bg-emerald-500 border-emerald-500 text-white"
              : "border-gray-300 text-transparent"
          }`}
        >
          <Check className="w-3.5 h-3.5" />
        </span>

        <div>
          <p
            className={`font-medium ${
              item.is_checked ? "text-gray-400 line-through" : "text-gray-900"
            }`}
          >
            {item.ingredient_name}
          </p>
          <p className="text-sm text-gray-500">
            {item.quantity} {item.unit}
          </p>
        </div>
      </button>

      <button
        type="button"
        onClick={() => onDelete(item.id)}
        className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
        aria-label="Delete item"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

const AddItemModal = ({ onClose, onSuccess }) => {
  const [ingredientName, setIngredientName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState("pcs");
  const [category, setCategory] = useState("Other");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!ingredientName.trim()) {
      toast.error("Please enter item name");
      return;
    }

    if (!quantity || Number(quantity) <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    setLoading(true);

    try {
      await api.post("/shopping-list", {
        ingredient_name: ingredientName.trim(),
        quantity: Number(quantity),
        unit: unit.trim() || "pcs",
        category,
      });

      toast.success("Item added");
      await onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to add item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-semibold text-gray-900">
            Add Shopping Item
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Item Name
            </label>
            <input
              type="text"
              value={ingredientName}
              onChange={(e) => setIngredientName(e.target.value)}
              placeholder="e.g. Tomatoes"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Quantity
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Unit
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {UNITS.map((unitOption) => (
                  <option key={unitOption} value={unitOption}>
                    {unitOption}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Adding..." : "Add Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShoppingList;
