document.addEventListener("DOMContentLoaded", () => {
    const sections = document.querySelectorAll('.hotel-section');
    // Define the color order
    const colorClasses = ['bg-hotel-light', 'bg-hotel-warm', 'bg-hotel-dark'];

    sections.forEach((section, index) => {
        // This math ensures the sections cycle 0, 1, 2, 0, 1, 2...
        const colorIndex = index % colorClasses.length;
        section.classList.add(colorClasses[colorIndex]);
    });
});