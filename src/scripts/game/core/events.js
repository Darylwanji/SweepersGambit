document.addEventListener('DOMContentLoaded', function() {
    const movementSelect = document.getElementById('movement');
    movementSelect.addEventListener('change', function() {
        if (!gameOver) {
            const currentMovementDiv = document.getElementById('current-movement');
            const movementType = movementSelect.value;
            currentMovementDiv.textContent = `Movement: ${movementType.charAt(0).toUpperCase() + movementType.slice(1)}`;
            calculateSurroundingMines();
            createBoard(); // Recalculate mine counts with new movement type
        }
    });
});