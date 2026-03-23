import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../App";
import { Button } from "../components/ui/button";
import { toast } from "sonner";

const IngredientScanner = ({ onIngredientsFound, onClose }) => {
  const { api } = useAuth();
  const [analyzing, setAnalyzing] = useState(false);
  const [preview, setPreview] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Please upload a JPEG, PNG, or WebP image");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async () => {
    if (!preview) return;

    setAnalyzing(true);
    try {
      // Extract base64 data (remove the data:image/...;base64, prefix)
      const base64Data = preview.split(",")[1];

      const response = await api.post("/ingredients/analyze", {
        image_base64: base64Data,
      });

      if (response.data.ingredients?.length > 0) {
        setIngredients(response.data.ingredients);
        toast.success(`Found ${response.data.ingredients.length} ingredients!`);
      } else {
        toast.error("Could not identify ingredients. Try a clearer photo.");
      }
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Failed to analyze image");
    } finally {
      setAnalyzing(false);
    }
  };

  const confirmIngredients = () => {
    if (onIngredientsFound) {
      onIngredientsFound(ingredients);
    }
    if (onClose) {
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading text-xl font-semibold text-stone-900">
            Scan Your Ingredients
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 hover:bg-stone-200"
          >
            ✕
          </button>
        </div>

        {!preview ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-stone-300 rounded-2xl p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
          >
            <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="font-medium text-stone-900 mb-1">
              Take a photo of your fridge or pantry
            </p>
            <p className="text-sm text-stone-500">
              We'll identify ingredients and suggest meals
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileSelect}
              className="hidden"
              data-testid="ingredient-file-input"
            />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Preview */}
            <div className="relative rounded-2xl overflow-hidden">
              <img
                src={preview}
                alt="Ingredient preview"
                className="w-full h-48 object-cover"
              />
              {analyzing && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-2" />
                    <p>Analyzing...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            {ingredients.length === 0 ? (
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setPreview(null);
                    setIngredients([]);
                  }}
                  variant="outline"
                  className="flex-1 rounded-full"
                >
                  Retake
                </Button>
                <Button
                  onClick={analyzeImage}
                  disabled={analyzing}
                  data-testid="analyze-btn"
                  className="flex-1 bg-primary text-white hover:bg-primary/90 rounded-full"
                >
                  {analyzing ? "Analyzing..." : "Identify Ingredients"}
                </Button>
              </div>
            ) : (
              <>
                {/* Found Ingredients */}
                <div>
                  <h3 className="font-medium text-stone-900 mb-2">
                    Found {ingredients.length} ingredients:
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {ingredients.map((ing, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-success/10 text-success rounded-full text-sm font-medium"
                      >
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setPreview(null);
                      setIngredients([]);
                    }}
                    variant="outline"
                    className="flex-1 rounded-full"
                  >
                    Scan Again
                  </Button>
                  <Button
                    onClick={confirmIngredients}
                    data-testid="use-ingredients-btn"
                    className="flex-1 bg-primary text-white hover:bg-primary/90 rounded-full"
                  >
                    Use These Ingredients
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        <p className="text-xs text-stone-400 text-center mt-4">
          Tip: Good lighting and clear shots work best!
        </p>
      </motion.div>
    </motion.div>
  );
};

export default IngredientScanner;
