"""
Structured JSON logging configuration.
"""
import logging.config
import sys

from pythonjsonlogger import jsonlogger


def setup_logging():
    """Configure structured JSON logging."""
    
    class CustomJsonFormatter(jsonlogger.JsonFormatter):
        """Custom JSON formatter with additional fields."""
        
        def add_fields(self, log_record, record, message_dict):
            super().add_fields(log_record, record, message_dict)
            
            # Add service name
            log_record['service'] = 'fastapi-backend'
            
            # Add level name
            log_record['level'] = record.levelname
            
            # Add timestamp
            log_record['timestamp'] = self.formatTime(record, self.datefmt)
    
    config = {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "json": {
                "()": CustomJsonFormatter,
                "format": "%(timestamp)s %(level)s %(name)s %(message)s",
                "datefmt": "%Y-%m-%dT%H:%M:%S%z"
            },
            "standard": {
                "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
            }
        },
        "handlers": {
            "console": {
                "level": "INFO",
                "class": "logging.StreamHandler",
                "formatter": "json",
                "stream": sys.stdout
            }
        },
        "root": {
            "level": "INFO",
            "handlers": ["console"]
        },
        "loggers": {
            "uvicorn": {
                "level": "INFO",
                "handlers": ["console"],
                "propagate": False
            },
            "uvicorn.access": {
                "level": "INFO",
                "handlers": ["console"],
                "propagate": False
            }
        }
    }
    
    logging.config.dictConfig(config)