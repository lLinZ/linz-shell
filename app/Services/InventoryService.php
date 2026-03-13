<?php

namespace App\Services;

use App\Models\Product;
use App\Models\InventoryMovement;
use Illuminate\Support\Facades\DB;
use Exception;

class InventoryService
{
    /**
     * Adjust the stock of a product by a specific quantity and log the movement.
     * Can be positive (addition) or negative (subtraction).
     *
     * @param Product $product
     * @param int $quantity Change in quantity (e.g., +5, -2)
     * @param string $type The reason for the change ('addition', 'subtraction', 'adjustment', 'sale', 'return')
     * @param int|null $userId ID of the user responsible for the change
     * @param string|null $reference An optional reference string (e.g., 'Order #1234')
     * @param string|null $notes Optional notes describing the reason
     * @return InventoryMovement
     * @throws Exception
     */
    public function adjustStock(
        Product $product,
        int $quantity,
        string $type,
        ?int $userId = null,
        ?string $reference = null,
        ?string $notes = null
    ): InventoryMovement {
        if ($quantity === 0) {
            throw new Exception("Quantity adjustment cannot be zero.");
        }

        return DB::transaction(function () use ($product, $quantity, $type, $userId, $reference, $notes) {
            // Lock the product row against concurrent updates
            $product = Product::where('id', $product->id)->lockForUpdate()->firstOrFail();

            $previousStock = $product->stock;
            $newStock = $previousStock + $quantity;

            if ($newStock < 0) {
                throw new Exception("Insufficient stock. Attempted to reduce below zero.");
            }

            // Update product stock
            $product->update(['stock' => $newStock]);

            // Create movement record
            return InventoryMovement::create([
                'product_id' => $product->id,
                'user_id' => $userId,
                'type' => $type,
                'quantity' => $quantity, // Will be positive or negative
                'previous_stock' => $previousStock,
                'current_stock' => $newStock,
                'reference' => $reference,
                'notes' => $notes,
            ]);
        });
    }

    /**
     * Set the stock of a product to a specific absolute value.
     */
    public function setStock(
        Product $product,
        int $newStock,
        ?int $userId = null,
        ?string $reference = null,
        ?string $notes = null
    ): ?InventoryMovement {
        if ($newStock < 0) {
            throw new Exception("Stock cannot be negative.");
        }

        $quantityDifference = $newStock - $product->stock;

        if ($quantityDifference === 0) {
            return null; // No change
        }

        $type = $quantityDifference > 0 ? 'addition' : 'subtraction';
        if ($notes === null && $reference === null) {
            $type = 'adjustment';
        }

        return $this->adjustStock(
            $product,
            $quantityDifference,
            $type,
            $userId,
            $reference,
            $notes ?? 'Auditoría/Ajuste manual'
        );
    }
}
