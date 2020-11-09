const TSConsoleReporter = require("jasmine-ts-console-reporter");

jasmine.getEnv().clearReporters();
jasmine.getEnv().addReporter(new TSConsoleReporter());