.PHONY: test check-isort check-black


test:
	pytest tests/



test-cov:
	pytest --cov-report html --cov=app --cov=core --cov=data --cov=domain --disable-warnings


lint: check-flake8 check-isort check-black

format:
	@isort app core data domain tests 2>&1
	@black app core data domain tests 2>&1

check-flake8:
	@echo "$(BOLD)Checking flake8$(RESET)"
	@flake8 app core data domain tests 2>&1


check-isort:
	@echo "$(BOLD)Checking isort$(RESET)"
	@isort --check-only app core data domain tests 2>&1


check-black:  ## Run the black tool in check mode only (won't modify files)
	@echo "$(BOLD)Checking black$(RESET)"
	@black --check app core data domain tests 2>&1
