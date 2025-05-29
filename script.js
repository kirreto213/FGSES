document.addEventListener('DOMContentLoaded', () => {
    const formSteps = document.querySelectorAll('.form-step');
    const prevButtons = document.querySelectorAll('.prev-step-btn');
    const nextButtons = document.querySelectorAll('.next-step-btn');

    // --- Elements for the step indicator (numbered circles) ---
    const stepIndicators = document.querySelectorAll('.step-indicator .step'); // Select all step number spans

    // --- NEW: Elements for the new progress bar and step titles (Assuming you will add these to HTML) ---
    // These elements are currently referenced but not present in your provided HTML.
    // Make sure to add them for the progress bar and step titles to work.
    const progressBar = document.getElementById('progressBar');
    const progressCount = document.getElementById('progressCount');
    const stepTitlesContainer = document.getElementById('stepTitles');
    const stepTitleItems = document.querySelectorAll('.step-title-item');

    let currentStep = 0; // Start at the first step (index 0)
    const totalSteps = formSteps.length;

    // --- Elements for dynamic date fields (Updated for Flatpickr) ---
    const shortTripRadio = document.getElementById('shortTrip');
    const longTripRadio = document.getElementById('longTrip');
    const additionalStaysDiv = document.getElementById('additionalStays');

    // Get all date range picker inputs
    const stay1DatesInput = document.getElementById('stay1Dates');
    const stay2DatesInput = document.getElementById('stay2Dates');
    const stay3DatesInput = document.getElementById('stay3Dates');
    // For Hotel stay date picker
    const hotelStayDatesInput = document.getElementById('hotelStayDates');

    // --- Airport Dropdown Population Logic (as discussed previously) ---
    const departureCityInput = document.getElementById('departureCity');
    const departureAirportSelect = document.getElementById('departureAirport');

    const cityAirportMap = {
        "Paris": ["CDG - Charles de Gaulle", "ORY - Orly"],
        "London": ["LHR - Heathrow", "LGW - Gatwick"],
        "Casablanca": ["CMN - Mohammed V"],
        "New York": ["JFK - John F. Kennedy", "LGA - LaGuardia", "EWR - Newark Liberty"],
        "Tokyo": ["HND - Haneda", "NRT - Narita"],
        // Add more cities and their airports as needed
    };

    if (departureCityInput && departureAirportSelect) {
        departureCityInput.addEventListener('input', () => {
            const city = departureCityInput.value.trim();
            const airports = cityAirportMap[city] || [];

            departureAirportSelect.innerHTML = '<option value="">Sélectionnez un aéroport</option>'; // Reset

            if (airports.length > 0) {
                airports.forEach(airport => {
                    const option = document.createElement('option');
                    option.value = airport.split(' ')[0]; // Use IATA code as value
                    option.textContent = airport;
                    departureAirportSelect.appendChild(option);
                });
            } else if (city !== '') {
                const option = document.createElement('option');
                option.value = "";
                option.textContent = "Aucun aéroport trouvé pour cette ville";
                departureAirportSelect.appendChild(option);
            }
        });
    }

    // --- Helper function to update form visibility and indicators ---
    const showStep = (stepIndex) => {
        formSteps.forEach((step, index) => {
            step.style.display = (index === stepIndex) ? 'block' : 'none';
        });

        // Update step indicators (the numbered circles) for color
        stepIndicators.forEach((indicator, index) => {
            indicator.classList.remove('active', 'finished'); // Reset classes for all indicators

            if (index === stepIndex) {
                indicator.classList.add('active'); // Current step is active
            } else if (index < stepIndex) {
                indicator.classList.add('finished'); // Previous steps are finished
            }
            // Steps ahead of the current step will have no special classes, remaining default.
        });

        // --- Update new step titles and progress bar (Conditional check for existence) ---
        if (stepTitleItems.length > 0) { // Only run if step titles are in HTML
            stepTitleItems.forEach((item, index) => {
                item.classList.remove('active', 'completed');
                if (index === stepIndex) {
                    item.classList.add('active');
                } else if (index < stepIndex) {
                    item.classList.add('completed');
                }
            });

            // Update progress bar width and text (Conditional check for existence)
            if (progressBar && progressCount) {
                const progressPercentage = ((stepIndex + 1) / totalSteps) * 100;
                progressBar.style.width = `${progressPercentage}%`;
                progressCount.textContent = `${stepIndex + 1}/${totalSteps}`;
            }

            // Scroll step titles into view if overflowing (Conditional check for existence)
            if (stepTitlesContainer) {
                const activeTitle = stepTitleItems[stepIndex];
                if (activeTitle) {
                    activeTitle.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                }
            }
        }


        // Specific logic to apply when stepping to Step 3 (index 2)
        if (stepIndex === 2) { // Step 3: Disponibilités
            updateAvailabilityFields();
        }
    };

    // --- Validation function for the current step ---
    const validateStep = (stepIndex) => {
        const currentFormStep = formSteps[stepIndex];
        const inputs = currentFormStep.querySelectorAll('input[required]:not([type="radio"]), textarea[required], select[required]'); // Exclude radios from initial check
        let isValid = true;

        inputs.forEach(input => {
            // Check if the input is visible and required
            if (input.offsetParent !== null && input.hasAttribute('required')) {
                if (!input.checkValidity()) {
                    isValid = false;
                    input.reportValidity(); // Show native browser validation message
                }
            }
        });

        // Specific validation for radio groups
        const radioGroups = currentFormStep.querySelectorAll('.radio-group, .radio-card-group'); // Include radio-card-group
        radioGroups.forEach(group => {
            const radioButtons = group.querySelectorAll('input[type="radio"]');
            const groupName = radioButtons[0]?.name;

            // Check if the group is visible and has a required radio that isn't checked
            if (groupName && group.querySelector(`input[name="${groupName}"][required]`) && !document.querySelector(`input[name="${groupName}"]:checked`)) {
                // Check if the group itself is currently visible
                if (group.offsetParent !== null) {
                    isValid = false;
                    // You might want a more subtle error than alert for radio groups
                    alert(`Veuillez faire une sélection pour l'option "${groupName}" qui est requise.`);
                }
            }
        });

        return isValid;
    };

    // --- Event Listeners for Next Buttons ---
    nextButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (validateStep(currentStep)) {
                if (currentStep < formSteps.length - 1) {
                    currentStep++;
                    showStep(currentStep);
                }
            }
        });
    });

    // --- Event Listeners for Previous Buttons ---
    prevButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (currentStep > 0) {
                currentStep--;
                showStep(currentStep);
            }
        });
    });

    // --- Event Listeners for Step Titles (clickable navigation) ---
    // Added conditional check for stepTitleItems existence
    if (stepTitleItems.length > 0) {
        stepTitleItems.forEach((item, index) => {
            item.addEventListener('click', () => {
                // Optional: You can uncomment and refine the validation logic here
                // if (validateStep(currentStep) || index < currentStep) { // Allow jumping back without validation
                currentStep = index;
                showStep(currentStep);
                // } else {
                //     alert("Veuillez remplir le pas actuel avant de passer.");
                // }
            });
        });
    }


    // --- Dynamic Field Toggling (Health and Accommodation) ---
    const toggleVisibility = (radioYes, targetDiv, targetInput) => {
        if (radioYes && radioYes.checked) { // Check if radioYes exists and is checked
            targetDiv.style.display = 'block';
            if (targetInput && targetInput.classList.contains('date-range-picker') && !targetInput._flatpickr) {
                flatpickr(targetInput, {
                    locale: "fr",
                    dateFormat: "d/m/Y",
                    mode: "range" // Date range for hotel stay too
                });
            }
        } else if (targetDiv) { // Ensure targetDiv exists before trying to hide it
            targetDiv.style.display = 'none';
            if (targetInput) {
                targetInput.value = ''; // Clear input when hidden
                if (targetInput._flatpickr) {
                    targetInput._flatpickr.destroy();
                    delete targetInput._flatpickr;
                }
            }
        }
    };

    // Elements for dynamic display for health and accommodation
    // Added null checks to prevent errors if elements aren't found (e.g., during development)
    const hotelYes = document.getElementById('hotelYes');
    const hotelNo = document.getElementById('hotelNo');
    const hotelStayDatesDiv = document.getElementById('hotelStayDatesDiv');

    const allergiesYes = document.getElementById('allergiesYes');
    const allergiesNo = document.getElementById('allergiesNo');
    const allergiesDetailsDiv = document.getElementById('allergiesDetailsDiv');
    const allergiesSpecifyInput = document.getElementById('allergiesSpecify');

    const medicalNeedsYes = document.getElementById('medicalNeedsYes');
    const medicalNeedsNo = document.getElementById('medicalNeedsNo');
    const medicalNeedsDetailsDiv = document.getElementById('medicalNeedsDetailsDiv');
    const medicalNeedsSpecifyInput = document.getElementById('medicalNeedsSpecify');

    // Event listeners for hotel stay (only if elements exist)
    if (hotelYes && hotelNo && hotelStayDatesDiv) {
        hotelYes.addEventListener('change', () => toggleVisibility(hotelYes, hotelStayDatesDiv, hotelStayDatesInput));
        hotelNo.addEventListener('change', () => toggleVisibility(hotelYes, hotelStayDatesDiv, hotelStayDatesInput));
    }

    // Event listeners for allergies (only if elements exist)
    if (allergiesYes && allergiesNo && allergiesDetailsDiv) {
        allergiesYes.addEventListener('change', () => toggleVisibility(allergiesYes, allergiesDetailsDiv, allergiesSpecifyInput));
        allergiesNo.addEventListener('change', () => toggleVisibility(allergiesYes, allergiesDetailsDiv, allergiesSpecifyInput));
    }

    // Event listeners for medical needs (only if elements exist)
    if (medicalNeedsYes && medicalNeedsNo && medicalNeedsDetailsDiv) {
        medicalNeedsYes.addEventListener('change', () => toggleVisibility(medicalNeedsYes, medicalNeedsDetailsDiv, medicalNeedsSpecifyInput));
        medicalNeedsNo.addEventListener('change', () => toggleVisibility(medicalNeedsYes, medicalNeedsDetailsDiv, medicalNeedsSpecifyInput));
    }


    // --- Logic: Link Trip Type (Step 2) to Availability (Step 3) ---
    const updateAvailabilityFields = () => {
        // Destroy existing flatpickr instances before potentially re-initializing or hiding
        const allStayInputs = [stay1DatesInput, stay2DatesInput, stay3DatesInput];
        allStayInputs.forEach(input => {
            if (input && input._flatpickr) { // Check if input exists and has flatpickr instance
                input._flatpickr.destroy();
                delete input._flatpickr;
            }
            if (input) { // Clear value and remove required attribute if input exists
                input.value = '';
                input.removeAttribute('required');
            }
        });

        if (shortTripRadio && shortTripRadio.checked) {
            additionalStaysDiv.style.display = 'block';
            if (stay1DatesInput) {
                stay1DatesInput.setAttribute('required', 'required');
                flatpickr(stay1DatesInput, { locale: "fr", dateFormat: "d/m/Y", mode: "range" });
            }
            if (stay2DatesInput) {
                flatpickr(stay2DatesInput, { locale: "fr", dateFormat: "d/m/Y", mode: "range" });
            }
            if (stay3DatesInput) {
                flatpickr(stay3DatesInput, { locale: "fr", dateFormat: "d/m/Y", mode: "range" });
            }

        } else if (longTripRadio && longTripRadio.checked) {
            additionalStaysDiv.style.display = 'none';
            if (stay1DatesInput) {
                stay1DatesInput.setAttribute('required', 'required');
                flatpickr(stay1DatesInput, { locale: "fr", dateFormat: "d/m/Y", mode: "range" });
            }
        } else if (additionalStaysDiv) { // Ensure additionalStaysDiv exists before hiding
            additionalStaysDiv.style.display = 'none';
        }
    };

    // Add event listeners to the trip type radio buttons (only if elements exist)
    if (shortTripRadio) {
        shortTripRadio.addEventListener('change', updateAvailabilityFields);
    }
    if (longTripRadio) {
        longTripRadio.addEventListener('change', updateAvailabilityFields);
    }


    // --- Form Submission Handling ---
    const form = document.getElementById('campusVisitForm');
    if (form) { // Only add listener if form exists
        form.addEventListener('submit', (event) => {
            event.preventDefault(); // Prevent default form submission

            // Final validation for the last step
            if (!validateStep(currentStep)) {
                return;
            }

            // Collect all form data
            const formData = new FormData(form);
            const data = {};
            for (const [key, value] of formData.entries()) {
                data[key] = value;
            }

            console.log('Formulaire soumis avec les données :', data);
            alert('Formulaire soumis avec succès ! (Voir la console du navigateur pour les données)');

            /*
            // Uncomment the fetch block below if you have a backend endpoint
            fetch('/submit-form-endpoint', {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(result => {
                console.log('Success:', result);
                alert('Formulaire soumis avec succès !');
                form.reset(); // Clear the form after successful submission
                showStep(0); // Go back to the first step
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Une erreur est survenue lors de la soumission du formulaire.');
            });
            */
        });
    }

    // Initialize the form by showing the first step and dynamic fields
    showStep(currentStep);
    // Initial calls for dynamic field visibility, added null checks
    if (hotelYes && hotelStayDatesDiv && hotelStayDatesInput) {
        toggleVisibility(hotelYes, hotelStayDatesDiv, hotelStayDatesInput);
    }
    if (allergiesYes && allergiesDetailsDiv && allergiesSpecifyInput) {
        toggleVisibility(allergiesYes, allergiesDetailsDiv, allergiesSpecifyInput);
    }
    if (medicalNeedsYes && medicalNeedsDetailsDiv && medicalNeedsSpecifyInput) {
        toggleVisibility(medicalNeedsYes, medicalNeedsDetailsDiv, medicalNeedsSpecifyInput);
    }
    updateAvailabilityFields(); // Ensure Flatpickr is applied on initial load for the first step
});