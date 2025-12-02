export const settings = {
    'onboarded': true,
    'resident_profile': {
        'first_name': 'Default',
        'last_name': 'Hub',
        'birthday': '1980-01-01',
        'mobile': '+61400000000',
        'email': 'default_hub@sofihub.com'
    },
    'location': {
        'country': 'AU',
        'region': 'Victoria',
        'city': 'Melbourne',
        'postcode': '3000'
    },
    'preferences': {
        'timezone': 'Australia/Melbourne',
        'mute_period': {
            'start': '00:00',
            'end': '00:00'
        },
        'speaker_spaces': [
            'Kitchen'
        ],
        'holidays': [],
        'tts': {
            'voice': 'AMY',
            'speed': 'DEFAULT'
        }
    },
    'routine': {
        'waking': {
            'weekdays': {
                'earliest': '07:00',
                'latest': '08:30'
            },
            'weekends': {
                'earliest': '08:30',
                'latest': '10:00'
            }
        },
        'sleeping': {
            'weekdays': {
                'earliest': '22:00',
                'latest': '23:30'
            },
            'weekends': {
                'earliest': '21:00',
                'latest': '22:30'
            }
        },
        'bathing': {
            'duration': 2700000
        }
    }
}
