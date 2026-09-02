class Dynamic_validation {

    static rules = {

        required: {
            validate: (value) => {
                return value.trim() !== "";
            },
            message: "This field is required"
        },

        minValue: {
            validate: (value, minValue) => {
                return Number(value) >= Number(minValue);
            },
            message: (minValue) => {
                return `Value must be at least ${minValue} & must be a number`;
            }
        },

        maxValue: {
            validate: (value, maxValue) => {
                return Number(value) <= Number(maxValue);
            },
            message: (maxValue) => {
                return `Value must be at most ${maxValue} & must be a number`;
            }
        },

        email: {
            validate: (value) => {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            },
            message: "Please enter a valid email address"
        },

        mobileNo: {
            validate: (value) => {
                return /^[6-9]\d{9}$/.test(value);
            },
            message: "Please enter a valid mobile no"
        },

        minLengthS: {
            validate: (value, minLength) => {
                return value.length >= Number(minLength);
            },
            message: (length) => {
                return `Must be at least ${length} characters`;
            }
        },

        maxLengthS: {
            validate: (value, maxLength) => {
                return value.length <= Number(maxLength);
            },
            message: (length) => {
                return `Must not exceed ${length} characters`;
            }
        },

        password: {
            validate: (value, minLength) => {
                return (
                    value.length >= Number(minLength) &&
                    /[A-Za-z]/.test(value) &&
                    /[0-9]/.test(value) &&
                    /[^A-Za-z0-9]/.test(value)
                );
            },
            message: (minLength) => {
                return `Password must contain ${minLength} characters, a letter, a number, and a special character`;
            }
        },

        sameAs: {
            validate: (value, otherValue) => {
                return value === otherValue;
            },
            message: "Values do not match"
        },

        imageUpload: {
            validate: (files, size, maxLimit, types) => {

                if (files.length === 0) {
                    return {
                        valid: false,
                        message: "Upload at least one file"
                    };
                }

                if (files.length > maxLimit) {
                    return {
                        valid: false,
                        message: "Maximum upload limit exceeded"
                    };
                }

                for (const file of files) {

                    if (file.size > size) {
                        return {
                            valid: false,
                            message: `${file.name} is too large`
                        };
                    }

                    if (!types.includes(file.type)) {
                        return {
                            valid: false,
                            message: `${file.name} has an invalid file type`
                        };
                    }
                }

                return {
                    valid: true,
                    message: null
                };
            }
        },

        dateRange: {
            validate: (value, maxDays) => {

                const selectedDate = new Date(value);

                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const maxDate = new Date(today);

                maxDate.setDate(
                    today.getDate() + Number(maxDays)
                );

                return (
                    selectedDate >= today &&
                    selectedDate <= maxDate
                );
            },

            message: (days) => {
                return `Date must be between today and ${days} days from today`;
            }
        },

        pattern: {
            validate: (value, regex) => {
                return new RegExp(regex).test(value);
            },
            message: "Invalid format"
        }
    };


    static validate(value, rules) {

        const error = [];

        for (const rule in rules) {

            const ruleValue = rules[rule];

            const validateRule =
                Dynamic_validation.rules[rule];

            const validationFunction =
                validateRule.validate;

            const result =
                validationFunction(
                    value,
                    ruleValue
                );

            const message_parse =
                typeof validateRule.message === "function"
                    ? validateRule.message(ruleValue)
                    : validateRule.message;

            if (
                (typeof result === "boolean" && !result) ||
                (typeof result === "object" && !result.valid)
            ) {

                error.push({
                    rule: rule,
                    message:
                        typeof result === "object"
                            ? result.message
                            : message_parse
                });
            }
        }

        return error;
    }
}
